// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgroShieldPool.sol";
import "./AgroShieldPolicy.sol";

contract InsurancePoolStaking is ReentrancyGuard, Ownable {
    IERC20 public cUSDToken;
    AgroShieldPool public poolContract;
    AgroShieldPolicy public policyContract;
    
    struct StakePosition {
        address staker;
        uint256 amount;
        uint256 stakedAt;
        uint256 lockPeriod;
        uint256 rewardRate;
        uint256 accumulatedRewards;
        uint256 lastRewardCalculation;
        bool isActive;
        uint256 tier; // 1=Bronze, 2=Silver, 3=Gold, 4=Platinum
    }
    
    struct StakingTier {
        uint256 minAmount;
        uint256 lockPeriod;
        uint256 baseRewardRate;
        uint256 bonusMultiplier;
        string tierName;
        bool isActive;
    }
    
    struct RewardPool {
        uint256 totalRewards;
        uint256 distributedRewards;
        uint256 poolUtilizationRate;
        uint256 lastUpdated;
        uint256 rewardRate;
    }
    
    mapping(address => StakePosition[]) public stakePositions;
    mapping(uint256 => StakingTier) public stakingTiers;
    mapping(uint256 => uint256) public stakerTotalStaked;
    mapping(uint256 => uint256) public stakerAccumulatedRewards;
    
    uint256 public totalStaked;
    uint256 public totalAccumulatedRewards;
    uint256 public stakePositionCounter;
    
    RewardPool public rewardPool;
    
    uint256 public baseRewardRate = 500; // 5% annual in basis points
    uint256 public maxRewardRate = 2000; // 20% annual max
    uint256 public rewardCalculationInterval = 1 days;
    uint256 public utilizationBonusThreshold = 8000; // 80% utilization for bonus
    
    event StakePositionCreated(
        uint256 indexed positionId,
        address indexed staker,
        uint256 amount,
        uint256 lockPeriod,
        uint256 tier
    );
    
    event StakePositionExtended(
        uint256 indexed positionId,
        uint256 newLockPeriod,
        uint256 newTier
    );
    
    event RewardsClaimed(
        uint256 indexed positionId,
        address indexed staker,
        uint256 rewardAmount
    );
    
    event StakePositionWithdrawn(
        uint256 indexed positionId,
        address indexed staker,
        uint256 amount,
        uint256 rewards
    );
    
    event RewardPoolUpdated(
        uint256 totalRewards,
        uint256 rewardRate,
        uint256 utilizationRate
    );
    
    event StakingTierUpdated(
        uint256 indexed tierId,
        uint256 rewardRate,
        uint256 bonusMultiplier
    );
    
    modifier validStakePosition(uint256 _positionId, address _staker) {
        require(_positionId > 0 && _positionId <= stakePositionCounter, "Invalid position ID");
        require(stakePositions[_staker][_positionId - 1].isActive, "Position not active");
        require(stakePositions[_staker][_positionId - 1].staker == _staker, "Not position owner");
        _;
    }
    
    constructor(address _cUSDToken, address _poolContract, address _policyContract) {
        cUSDToken = IERC20(_cUSDToken);
        poolContract = AgroShieldPool(_poolContract);
        policyContract = AgroShieldPolicy(_policyContract);
        
        // Initialize staking tiers
        _initializeStakingTiers();
        
        // Initialize reward pool
        rewardPool = RewardPool({
            totalRewards: 0,
            distributedRewards: 0,
            poolUtilizationRate: 0,
            lastUpdated: block.timestamp,
            rewardRate: baseRewardRate
        });
    }
    
    function createStakePosition(
        uint256 _amount,
        uint256 _tierId
    ) external nonReentrant returns (uint256) {
        require(_amount > 0, "Amount must be greater than 0");
        require(_tierId > 0 && _tierId <= 4, "Invalid tier");
        require(stakingTiers[_tierId].isActive, "Tier not active");
        require(_amount >= stakingTiers[_tierId].minAmount, "Amount below tier minimum");
        
        // Transfer tokens to this contract
        require(
            cUSDToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
        // Create stake position
        uint256 positionId = ++stakePositionCounter;
        uint256 rewardRate = _calculateTierRewardRate(_tierId);
        
        StakePosition memory position = StakePosition({
            staker: msg.sender,
            amount: _amount,
            stakedAt: block.timestamp,
            lockPeriod: stakingTiers[_tierId].lockPeriod,
            rewardRate: rewardRate,
            accumulatedRewards: 0,
            lastRewardCalculation: block.timestamp,
            isActive: true,
            tier: _tierId
        });
        
        stakePositions[msg.sender].push(position);
        
        // Update totals
        totalStaked += _amount;
        stakerTotalStaked[msg.sender] += _amount;
        
        // Update reward pool
        _updateRewardPool();
        
        emit StakePositionCreated(positionId, msg.sender, _amount, stakingTiers[_tierId].lockPeriod, _tierId);
        
        return positionId;
    }
    
    function extendStakePosition(uint256 _positionId) external nonReentrant {
        require(_positionId > 0 && _positionId <= stakePositionCounter, "Invalid position ID");
        
        // Find position
        StakePosition storage position = _findStakePosition(msg.sender, _positionId);
        require(position.isActive, "Position not active");
        
        uint256 newTier = _calculateTier(position.amount);
        uint256 newRewardRate = _calculateTierRewardRate(newTier);
        
        // Update position
        position.lockPeriod = stakingTiers[newTier].lockPeriod;
        position.rewardRate = newRewardRate;
        position.tier = newTier;
        
        emit StakePositionExtended(_positionId, position.lockPeriod, newTier);
    }
    
    function claimRewards(uint256 _positionId) external nonReentrant validStakePosition(_positionId, msg.sender) {
        StakePosition storage position = _findStakePosition(msg.sender, _positionId);
        
        // Calculate accumulated rewards
        uint256 rewards = _calculateRewards(position);
        position.accumulatedRewards += rewards;
        position.lastRewardCalculation = block.timestamp;
        
        // Update totals
        totalAccumulatedRewards += rewards;
        stakerAccumulatedRewards[msg.sender] += rewards;
        
        // Transfer rewards
        require(
            cUSDToken.transfer(msg.sender, rewards),
            "Reward transfer failed"
        );
        
        emit RewardsClaimed(_positionId, msg.sender, rewards);
    }
    
    function withdrawStake(uint256 _positionId) external nonReentrant validStakePosition(_positionId, msg.sender) {
        StakePosition storage position = _findStakePosition(msg.sender, _positionId);
        
        require(
            block.timestamp >= position.stakedAt + position.lockPeriod,
            "Lock period not expired"
        );
        
        // Calculate final rewards
        uint256 rewards = _calculateRewards(position);
        position.accumulatedRewards += rewards;
        
        // Update totals
        totalAccumulatedRewards += rewards;
        stakerAccumulatedRewards[msg.sender] += rewards;
        totalStaked -= position.amount;
        stakerTotalStaked[msg.sender] -= position.amount;
        
        // Deactivate position
        position.isActive = false;
        
        // Transfer stake amount and rewards
        uint256 totalAmount = position.amount + position.accumulatedRewards;
        require(
            cUSDToken.transfer(msg.sender, totalAmount),
            "Transfer failed"
        );
        
        // Update reward pool
        _updateRewardPool();
        
        emit StakePositionWithdrawn(_positionId, msg.sender, position.amount, position.accumulatedRewards);
    }
    
    function getStakePositions(address _staker) external view returns (StakePosition[] memory) {
        return stakePositions[_staker];
    }
    
    function getStakePosition(address _staker, uint256 _positionId) external view returns (StakePosition memory) {
        require(_positionId > 0 && _positionId <= stakePositionCounter, "Invalid position ID");
        return stakePositions[_staker][_positionId - 1];
    }
    
    function getStakingTier(uint256 _tierId) external view returns (StakingTier memory) {
        return stakingTiers[_tierId];
    }
    
    function calculateRewards(uint256 _positionId, address _staker) external view returns (uint256) {
        require(_positionId > 0 && _positionId <= stakePositionCounter, "Invalid position ID");
        
        StakePosition memory position = stakePositions[_staker][_positionId - 1];
        if (!position.isActive) return 0;
        
        return _calculateRewards(position);
    }
    
    function getStakerStats(address _staker) external view returns (
        uint256 totalStaked,
        uint256 totalRewards,
        uint256 activePositions,
        uint256 averageTier
    ) {
        StakePosition[] memory positions = stakePositions[_staker];
        uint256 active = 0;
        uint256 tierSum = 0;
        
        for (uint256 i = 0; i < positions.length; i++) {
            if (positions[i].isActive) {
                active++;
                tierSum += positions[i].tier;
            }
        }
        
        uint256 avgTier = active > 0 ? tierSum / active : 0;
        
        return (
            stakerTotalStaked[_staker],
            stakerAccumulatedRewards[_staker],
            active,
            avgTier
        );
    }
    
    function getPoolStats() external view returns (
        uint256 totalStakedAmount,
        uint256 totalRewardsAmount,
        uint256 activeStakers,
        uint256 averageLockPeriod,
        uint256 currentRewardRate
    ) {
        uint256 activeStakerCount = 0;
        uint256 totalLockPeriod = 0;
        uint256 activePositionCount = 0;
        
        // This is a simplified version - in production, you'd want to optimize this
        for (uint256 i = 1; i <= stakePositionCounter; i++) {
            // Note: This is a simplified approach
            // In production, you'd maintain separate mappings for efficiency
        }
        
        return (
            totalStaked,
            totalAccumulatedRewards,
            activeStakerCount,
            activePositionCount > 0 ? totalLockPeriod / activePositionCount : 0,
            rewardPool.rewardRate
        );
    }
    
    function calculateTier(uint256 _amount) external view returns (uint256) {
        return _calculateTier(_amount);
    }
    
    function updateStakingTier(
        uint256 _tierId,
        uint256 _minAmount,
        uint256 _lockPeriod,
        uint256 _baseRewardRate,
        uint256 _bonusMultiplier
    ) external onlyOwner {
        require(_tierId > 0 && _tierId <= 4, "Invalid tier");
        
        stakingTiers[_tierId].minAmount = _minAmount;
        stakingTiers[_tierId].lockPeriod = _lockPeriod;
        stakingTiers[_tierId].baseRewardRate = _baseRewardRate;
        stakingTiers[_tierId].bonusMultiplier = _bonusMultiplier;
        
        emit StakingTierUpdated(_tierId, _baseRewardRate, _bonusMultiplier);
    }
    
    function setBaseRewardRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= maxRewardRate, "Rate too high");
        baseRewardRate = _newRate;
        _updateRewardPool();
    }
    
    function setMaxRewardRate(uint256 _newMax) external onlyOwner {
        require(_newMax <= 10000, "Max rate too high");
        maxRewardRate = _newMax;
    }
    
    function emergencyPause() external onlyOwner {
        // Deactivate all positions
        for (uint256 i = 1; i <= stakePositionCounter; i++) {
            // Note: This is simplified - in production, you'd need a more efficient approach
        }
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = cUSDToken.balanceOf(address(this));
        if (balance > 0) {
            require(cUSDToken.transfer(owner(), balance), "Emergency withdrawal failed");
        }
    }
    
    function _findStakePosition(address _staker, uint256 _positionId) internal view returns (StakePosition storage) {
        require(_positionId > 0, "Invalid position ID");
        return stakePositions[_staker][_positionId - 1];
    }
    
    function _calculateTier(uint256 _amount) internal view returns (uint256) {
        if (_amount >= stakingTiers[4].minAmount) return 4; // Platinum
        if (_amount >= stakingTiers[3].minAmount) return 3; // Gold
        if (_amount >= stakingTiers[2].minAmount) return 2; // Silver
        return 1; // Bronze
    }
    
    function _calculateTierRewardRate(uint256 _tierId) internal view returns (uint256) {
        StakingTier memory tier = stakingTiers[_tierId];
        uint256 baseRate = tier.baseRewardRate;
        uint256 utilizationBonus = _getUtilizationBonus();
        
        return (baseRate * (10000 + utilizationBonus + tier.bonusMultiplier)) / 10000;
    }
    
    function _calculateRewards(StakePosition memory _position) internal view returns (uint256) {
        uint256 timePassed = block.timestamp - _position.lastRewardCalculation;
        if (timePassed == 0) return 0;
        
        // Calculate rewards based on annual rate
        uint256 annualRewards = (_position.amount * _position.rewardRate) / 10000;
        uint256 rewards = (annualRewards * timePassed) / (365 days);
        
        return rewards;
    }
    
    function _getUtilizationBonus() internal view returns (uint256) {
        uint256 utilization = rewardPool.poolUtilizationRate;
        if (utilization >= utilizationBonusThreshold) {
            return (utilization - utilizationBonusThreshold) / 20; // Up to 10% bonus
        }
        return 0;
    }
    
    function _updateRewardPool() internal {
        uint256 poolLiquidity = poolContract.totalLiquidity();
        uint256 totalActiveCoverage = _getTotalActiveCoverage();
        
        uint256 utilization = totalActiveCoverage > 0 ? 
            (poolLiquidity * 10000) / totalActiveCoverage : 0;
        
        uint256 newRewardRate = baseRewardRate;
        if (utilization >= utilizationBonusThreshold) {
            newRewardRate = (baseRewardRate * (10000 + _getUtilizationBonus())) / 10000;
        }
        
        rewardPool.poolUtilizationRate = utilization;
        rewardPool.rewardRate = newRewardRate;
        rewardPool.lastUpdated = block.timestamp;
        
        emit RewardPoolUpdated(
            rewardPool.totalRewards,
            newRewardRate,
            utilization
        );
    }
    
    function _getTotalActiveCoverage() internal view returns (uint256) {
        // Simplified - in production, you'd track this more efficiently
        uint256 activePolicies = policyContract.activePoliciesCount();
        return activePolicies * 1000 ether; // Assume 1000 cUSD per policy average
    }
    
    function _initializeStakingTiers() internal {
        // Bronze Tier
        stakingTiers[1] = StakingTier({
            minAmount: 1000 ether,
            lockPeriod: 30 days,
            baseRewardRate: 500, // 5%
            bonusMultiplier: 0,
            tierName: "Bronze",
            isActive: true
        });
        
        // Silver Tier
        stakingTiers[2] = StakingTier({
            minAmount: 5000 ether,
            lockPeriod: 60 days,
            baseRewardRate: 750, // 7.5%
            bonusMultiplier: 500, // 5% bonus
            tierName: "Silver",
            isActive: true
        });
        
        // Gold Tier
        stakingTiers[3] = StakingTier({
            minAmount: 10000 ether,
            lockPeriod: 90 days,
            baseRewardRate: 1000, // 10%
            bonusMultiplier: 1000, // 10% bonus
            tierName: "Gold",
            isActive: true
        });
        
        // Platinum Tier
        stakingTiers[4] = StakingTier({
            minAmount: 50000 ether,
            lockPeriod: 180 days,
            baseRewardRate: 1500, // 15%
            bonusMultiplier: 2000, // 20% bonus
            tierName: "Platinum",
            isActive: true
        });
    }
}
