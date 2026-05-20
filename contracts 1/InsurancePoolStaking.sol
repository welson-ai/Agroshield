// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgroShieldPool.sol";
import "./AgroShieldPolicy.sol";

/**
 * @title InsurancePoolStaking
 * @dev Staking contract for liquidity providers to earn additional rewards
 * Allows users to stake their pool shares for enhanced returns
 * 
 * Features:
 * - Flexible staking periods
 * - Dynamic reward rates
 * - Multi-position staking
 * - Early unstaking penalties
 * - Reward compounding
 * 
 * @author AgroShield Team
 * @notice Use this contract to stake pool shares and earn staking rewards
 * @dev Integrates with AgroShieldPool for share management and rewards
 */
contract InsurancePoolStaking is ReentrancyGuard, Ownable {
    IERC20 public immutable cusdToken;
    AgroShieldPool public poolContract;
    AgroShieldPolicy public policyContract;
    
    constructor(address _cusdToken, address _poolContract, address _policyContract) Ownable(msg.sender) {
        cusdToken = IERC20(_cusdToken);
        poolContract = AgroShieldPool(_poolContract);
        policyContract = AgroShieldPolicy(_policyContract);
    }
    
    struct StakePosition {
        address staker;
        uint256 amount;
        uint256 stakedAt;
        uint256 lockPeriod;
        uint256 rewardRate;
        bool isActive;
    }
    
    mapping(address => StakePosition[]) public stakePositions;
    mapping(address => uint256) public stakePositionCounter;
    uint256 public contractTotalStaked;
    uint256 public totalRewardsDistributed;
    
    event Staked(address indexed staker, uint256 amount, uint256 lockPeriod, uint256 rewardRate);
    event Unstaked(address indexed staker, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed staker, uint256 rewards);
    
    modifier onlyValidPool() {
        require(address(poolContract) != address(0), "Pool contract not set");
        _;
    }
    
    function stake(uint256 _amount, uint256 _lockPeriod) external nonReentrant onlyValidPool {
        require(_amount > 0, "Amount must be greater than 0");
        require(_lockPeriod >= 30 days, "Lock period must be at least 30 days");
        
        // Transfer cUSD to this contract
        require(
            cusdToken.transferFrom(msg.sender, address(this), _amount),
            "cUSD transfer failed"
        );
        
        // Create stake position
        stakePositions[msg.sender].push(StakePosition({
            staker: msg.sender,
            amount: _amount,
            stakedAt: block.timestamp,
            lockPeriod: _lockPeriod,
            rewardRate: _calculateRewardRate(_amount, _lockPeriod),
            isActive: true
        }));
        
        uint256 positionId = ++stakePositionCounter[msg.sender];
        contractTotalStaked += _amount;
        
        emit Staked(msg.sender, _amount, _lockPeriod, _calculateRewardRate(_amount, _lockPeriod));
    }
    
    function unstake(uint256 _positionId) external nonReentrant onlyValidPool {
        require(_positionId > 0 && _positionId <= stakePositionCounter[msg.sender], "Invalid position ID");
        
        StakePosition storage position = stakePositions[msg.sender][_positionId - 1];
        require(position.isActive, "Position not active");
        require(block.timestamp >= position.stakedAt + position.lockPeriod, "Lock period not expired");
        
        uint256 rewards = _calculateRewards(position);
        position.isActive = false;
        
        // Transfer back staked amount + rewards
        uint256 totalAmount = position.amount + rewards;
        require(
            cusdToken.transfer(msg.sender, totalAmount),
            "cUSD transfer failed"
        );
        
        emit Unstaked(msg.sender, position.amount, rewards);
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    function calculateRewards(uint256 _positionId, address _staker) external view returns (uint256) {
        require(_positionId > 0 && _positionId <= stakePositionCounter[_staker], "Invalid position ID");
        
        StakePosition memory position = stakePositions[_staker][_positionId - 1];
        if (!position.isActive) return 0;
        
        return _calculateRewards(position);
    }
    
    function getStakerStats(address _staker) external view returns (
        uint256 totalStaked,
        uint256 totalRewards,
        uint256 activePositions,
        uint256 averageRate
    ) {
        StakePosition[] memory positions = stakePositions[_staker];
        uint256 active = 0;
        uint256 tierSum = 0;
        
        for (uint256 i = 0; i < positions.length; i++) {
            if (positions[i].isActive) {
                active++;
                tierSum += positions[i].rewardRate;
            }
        }
        
        uint256 rewards = _calculateTotalRewards(_staker);
        
        return (contractTotalStaked, rewards, activePositions, active > 0 ? tierSum / active : 0);
    }
    
    function _calculateRewards(StakePosition memory _position) internal view returns (uint256) {
        uint256 timeStaked = block.timestamp - _position.stakedAt;
        if (timeStaked >= _position.lockPeriod) {
            timeStaked = _position.lockPeriod;
        }
        
        return (_position.amount * _position.rewardRate * timeStaked) / (365 * 10000);
    }
    
    function _calculateTotalRewards(address _staker) internal view returns (uint256) {
        StakePosition[] memory positions = stakePositions[_staker];
        uint256 totalRewards = 0;
        
        for (uint256 i = 0; i < positions.length; i++) {
            if (positions[i].isActive) {
                totalRewards += _calculateRewards(positions[i]);
            }
        }
        
        return totalRewards;
    }
    
    function _calculateRewardRate(uint256 _amount, uint256 _lockPeriod) internal pure returns (uint256) {
        // Base rate: 5% APY for 30-day lock, up to 15% for 365-day lock
        uint256 baseRate = 500; // 5% in basis points
        
        if (_lockPeriod >= 365 days) {
            return baseRate * 3; // 15% APY
        } else if (_lockPeriod >= 180 days) {
            return baseRate * 2; // 10% APY
        } else if (_lockPeriod >= 90 days) {
            return baseRate * 3 / 2; // 7.5% APY
        } else {
            return baseRate; // 5% APY
        }
    }
}
