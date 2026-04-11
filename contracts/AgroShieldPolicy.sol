// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgroShieldPolicy
 * @dev Policy contract for farmers to purchase crop insurance policies
 * Manages policy creation, premium payments, and payout coordination
 */
contract AgroShieldPolicy is Ownable, ReentrancyGuard {
    
    // cUSD token on Celo Alfajores testnet
    IERC20 public immutable cusdToken;
    
    // Pool contract for liquidity management
    address public poolContract;
    
    // Oracle contract for weather data
    address public oracleContract;
    
    // Policy structure
    struct Policy {
        uint256 policyId;
        address farmer;
        uint256 coverageAmount;
        uint256 premiumAmount;
        uint256 rainfallThreshold; // in mm
        uint256 measurementPeriod; // in days
        uint256 startTime;
        uint256 endTime;
        bool active;
        bool paidOut;
        uint256 location; // simplified location identifier
    }
    
    // Policy tracking
    mapping(uint256 => Policy) public policies;
    mapping(address => uint256[]) public farmerPolicies;
    uint256 public nextPolicyId;
    
    // Premium calculation parameters
    uint256 public basePremiumRate = 500; // 5% base premium (500/10000)
    uint256 public constant BASIS_POINTS = 10000;
    
    // Events
    event PolicyCreated(
        uint256 indexed policyId,
        address indexed farmer,
        uint256 coverageAmount,
        uint256 premiumAmount,
        uint256 rainfallThreshold,
        uint256 measurementPeriod,
        uint256 location
    );
    
    event PremiumPaid(uint256 indexed policyId, uint256 amount);
    event PolicyActivated(uint256 indexed policyId);
    event PolicyExpired(uint256 indexed policyId);
    event PayoutTriggered(uint256 indexed policyId, uint256 amount, uint256 actualRainfall);
    
    // Modifiers
    modifier onlyAuthorizedOracle() {
        require(msg.sender == oracleContract, "Only authorized oracle");
        _;
    }
    
    modifier policyExists(uint256 policyId) {
        require(policyId < nextPolicyId, "Policy does not exist");
        _;
    }
    
    modifier onlyPolicyOwner(uint256 policyId) {
        require(policies[policyId].farmer == msg.sender, "Not policy owner");
        _;
    }
    
    constructor(address _cusdToken, address _poolContract) {
        cusdToken = IERC20(_cusdToken);
        poolContract = _poolContract;
        nextPolicyId = 1;
    }
    
    /**
     * @dev Set the oracle contract address
     * @param _oracleContract Address of the oracle contract
     */
    function setOracleContract(address _oracleContract) external onlyOwner {
        oracleContract = _oracleContract;
    }
    
    /**
     * @dev Create a new insurance policy
     * @param coverageAmount Amount of coverage in cUSD
     * @param rainfallThreshold Rainfall threshold in mm
     * @param measurementPeriod Measurement period in days
     * @param location Location identifier
     */
    function createPolicy(
        uint256 coverageAmount,
        uint256 rainfallThreshold,
        uint256 measurementPeriod,
        uint256 location
    ) external returns (uint256 policyId) {
        require(coverageAmount > 0, "Coverage amount must be greater than 0");
        require(rainfallThreshold > 0, "Rainfall threshold must be greater than 0");
        require(measurementPeriod > 0, "Measurement period must be greater than 0");
        
        // Calculate premium based on coverage amount and risk factors
        uint256 premiumAmount = _calculatePremium(coverageAmount, rainfallThreshold, measurementPeriod);
        
        // Create policy
        policyId = nextPolicyId++;
        policies[policyId] = Policy({
            policyId: policyId,
            farmer: msg.sender,
            coverageAmount: coverageAmount,
            premiumAmount: premiumAmount,
            rainfallThreshold: rainfallThreshold,
            measurementPeriod: measurementPeriod,
            startTime: 0, // Set when premium is paid
            endTime: 0,   // Set when premium is paid
            active: false,
            paidOut: false,
            location: location
        });
        
        // Track policy for farmer
        farmerPolicies[msg.sender].push(policyId);
        
        emit PolicyCreated(
            policyId,
            msg.sender,
            coverageAmount,
            premiumAmount,
            rainfallThreshold,
            measurementPeriod,
            location
        );
    }
    
    /**
     * @dev Pay premium to activate policy
     * @param policyId ID of the policy
     */
    function payPremium(uint256 policyId) 
        external 
        nonReentrant 
        policyExists(policyId) 
        onlyPolicyOwner(policyId) 
    {
        Policy storage policy = policies[policyId];
        require(!policy.active, "Policy already active");
        require(!policy.paidOut, "Policy already paid out");
        
        // Transfer premium from farmer to pool
        require(
            cusdToken.transferFrom(msg.sender, poolContract, policy.premiumAmount),
            "Premium payment failed"
        );
        
        // Activate policy
        policy.active = true;
        policy.startTime = block.timestamp;
        policy.endTime = block.timestamp + (policy.measurementPeriod * 1 days);
        
        emit PremiumPaid(policyId, policy.premiumAmount);
        emit PolicyActivated(policyId);
    }
    
    /**
     * @dev Trigger payout based on weather data (called by oracle)
     * @param policyId ID of the policy
     * @param actualRainfall Actual rainfall amount in mm
     */
    function triggerPayout(uint256 policyId, uint256 actualRainfall) 
        external 
        onlyAuthorizedOracle 
        policyExists(policyId) 
        nonReentrant 
    {
        Policy storage policy = policies[policyId];
        require(policy.active, "Policy not active");
        require(!policy.paidOut, "Policy already paid out");
        require(block.timestamp <= policy.endTime, "Policy expired");
        
        // Check if rainfall threshold is breached
        if (actualRainfall < policy.rainfallThreshold) {
            policy.paidOut = true;
            policy.active = false;
            
            // Request payout from pool
            IAgroShieldPool(poolContract).processPayout(policy.coverageAmount);
            
            emit PayoutTriggered(policyId, policy.coverageAmount, actualRainfall);
        }
    }
    
    /**
     * @dev Expire policy if measurement period is over
     * @param policyId ID of the policy
     */
    function expirePolicy(uint256 policyId) external policyExists(policyId) {
        Policy storage policy = policies[policyId];
        require(policy.active, "Policy not active");
        require(block.timestamp > policy.endTime, "Policy not expired");
        
        policy.active = false;
        emit PolicyExpired(policyId);
    }
    
    /**
     * @dev Calculate premium based on coverage and risk factors
     * @param coverageAmount Coverage amount
     * @param rainfallThreshold Rainfall threshold
     * @param measurementPeriod Measurement period
     * @return premiumAmount Calculated premium
     */
    function _calculatePremium(
        uint256 coverageAmount,
        uint256 rainfallThreshold,
        uint256 measurementPeriod
    ) internal view returns (uint256 premiumAmount) {
        // Base premium rate
        premiumAmount = (coverageAmount * basePremiumRate) / BASIS_POINTS;
        
        // Risk adjustment based on rainfall threshold (lower threshold = higher risk)
        uint256 riskFactor = BASIS_POINTS / rainfallThreshold;
        premiumAmount = (premiumAmount * riskFactor) / BASIS_POINTS;
        
        // Time adjustment based on measurement period
        uint256 timeFactor = measurementPeriod / 30; // Normalize to 30-day periods
        premiumAmount = (premiumAmount * timeFactor) / 1;
        
        // Ensure minimum premium
        uint256 minPremium = (coverageAmount * 100) / BASIS_POINTS; // 1% minimum
        if (premiumAmount < minPremium) {
            premiumAmount = minPremium;
        }
    }
    
    /**
     * @dev Get policy details
     * @param policyId ID of the policy
     * @return Policy details
     */
    function getPolicy(uint256 policyId) 
        external 
        view 
        policyExists(policyId) 
        returns (Policy memory) 
    {
        return policies[policyId];
    }
    
    /**
     * @dev Get all policies for a farmer
     * @param farmer Address of the farmer
     * @return Array of policy IDs
     */
    function getFarmerPolicies(address farmer) external view returns (uint256[] memory) {
        return farmerPolicies[farmer];
    }
    
    /**
     * @dev Get active policies count
     * @return Number of active policies
     */
    function getActivePoliciesCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i < nextPolicyId; i++) {
            if (policies[i].active) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Update base premium rate (owner only)
     * @param newRate New premium rate in basis points
     */
    function updateBasePremiumRate(uint256 newRate) external onlyOwner {
        require(newRate > 0 && newRate <= BASIS_POINTS, "Invalid rate");
        basePremiumRate = newRate;
    }
}

/**
 * @dev Interface for AgroShieldPool
 */
interface IAgroShieldPool {
    function processPayout(uint256 amount) external;
}
