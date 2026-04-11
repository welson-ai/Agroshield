// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AgroShieldOracle
 * @dev Oracle contract for weather data and automatic payout triggering
 * Manages weather data feeds and triggers policy payouts based on rainfall thresholds
 */
contract AgroShieldOracle is Ownable, ReentrancyGuard {
    
    // Policy contract address
    address public policyContract;
    
    // Authorized data providers
    mapping(address => bool) public authorizedProviders;
    
    // Weather data structure
    struct WeatherData {
        uint256 location;
        uint256 timestamp;
        uint256 rainfall; // in mm
        uint256 temperature; // in Celsius (optional)
        uint256 humidity; // in percentage (optional)
        bool verified;
    }
    
    // Location data storage
    mapping(uint256 => WeatherData[]) public locationWeatherHistory;
    mapping(uint256 => mapping(uint256 => WeatherData)) public specificWeatherData; // location => timestamp => data
    
    // Pending verifications
    mapping(bytes32 => bool) public pendingVerifications;
    
    // Data verification requirements
    uint256 public minConfirmations = 2;
    mapping(bytes32 => uint256) public confirmationCount;
    mapping(bytes32 => mapping(address => bool)) public hasConfirmed;
    
    // Events
    event WeatherDataSubmitted(
        uint256 indexed location,
        uint256 indexed timestamp,
        uint256 rainfall,
        address indexed provider
    );
    
    event WeatherDataVerified(
        uint256 indexed location,
        uint256 indexed timestamp,
        uint256 rainfall
    );
    
    event PayoutTriggered(
        uint256 indexed policyId,
        uint256 indexed location,
        uint256 actualRainfall,
        uint256 threshold
    );
    
    event ProviderAuthorized(address indexed provider);
    event ProviderDeauthorized(address indexed provider);
    
    // Modifiers
    modifier onlyAuthorizedProvider() {
        require(authorizedProviders[msg.sender], "Not authorized provider");
        _;
    }
    
    modifier onlyPolicyContract() {
        require(msg.sender == policyContract, "Only policy contract");
        _;
    }
    
    constructor() {
        // Contract deployer is initially authorized as provider
        authorizedProviders[msg.sender] = true;
    }
    
    /**
     * @dev Set the policy contract address
     * @param _policyContract Address of the policy contract
     */
    function setPolicyContract(address _policyContract) external onlyOwner {
        policyContract = _policyContract;
    }
    
    /**
     * @dev Authorize a weather data provider
     * @param provider Address of the provider
     */
    function authorizeProvider(address provider) external onlyOwner {
        authorizedProviders[provider] = true;
        emit ProviderAuthorized(provider);
    }
    
    /**
     * @dev Deauthorize a weather data provider
     * @param provider Address of the provider
     */
    function deauthorizeProvider(address provider) external onlyOwner {
        authorizedProviders[provider] = false;
        emit ProviderDeauthorized(provider);
    }
    
    /**
     * @dev Submit weather data for a location and timestamp
     * @param location Location identifier
     * @param timestamp Unix timestamp
     * @param rainfall Rainfall amount in mm
     * @param temperature Temperature in Celsius (optional)
     * @param humidity Humidity percentage (optional)
     */
    function submitWeatherData(
        uint256 location,
        uint256 timestamp,
        uint256 rainfall,
        uint256 temperature,
        uint256 humidity
    ) external onlyAuthorizedProvider {
        require(timestamp <= block.timestamp, "Future timestamp not allowed");
        require(rainfall >= 0, "Invalid rainfall value");
        
        bytes32 dataHash = keccak256(abi.encodePacked(location, timestamp, rainfall));
        
        // Check if this data has already been confirmed
        if (specificWeatherData[location][timestamp].verified) {
            return; // Data already verified
        }
        
        // If this is the first submission, create pending verification
        if (confirmationCount[dataHash] == 0) {
            pendingVerifications[dataHash] = true;
        }
        
        // Check if provider has already confirmed this data
        require(!hasConfirmed[dataHash][msg.sender], "Provider already confirmed");
        
        // Record confirmation
        confirmationCount[dataHash]++;
        hasConfirmed[dataHash][msg.sender] = true;
        
        emit WeatherDataSubmitted(location, timestamp, rainfall, msg.sender);
        
        // Check if we have enough confirmations
        if (confirmationCount[dataHash] >= minConfirmations) {
            _verifyWeatherData(location, timestamp, rainfall, temperature, humidity);
        }
    }
    
    /**
     * @dev Internal function to verify weather data
     * @param location Location identifier
     * @param timestamp Unix timestamp
     * @param rainfall Rainfall amount in mm
     * @param temperature Temperature in Celsius
     * @param humidity Humidity percentage
     */
    function _verifyWeatherData(
        uint256 location,
        uint256 timestamp,
        uint256 rainfall,
        uint256 temperature,
        uint256 humidity
    ) internal {
        bytes32 dataHash = keccak256(abi.encodePacked(location, timestamp, rainfall));
        
        // Create weather data record
        WeatherData memory data = WeatherData({
            location: location,
            timestamp: timestamp,
            rainfall: rainfall,
            temperature: temperature,
            humidity: humidity,
            verified: true
        });
        
        // Store verified data
        specificWeatherData[location][timestamp] = data;
        locationWeatherHistory[location].push(data);
        
        // Remove from pending
        pendingVerifications[dataHash] = false;
        
        emit WeatherDataVerified(location, timestamp, rainfall);
        
        // Check for policy payouts
        _checkPolicyPayouts(location, timestamp, rainfall);
    }
    
    /**
     * @dev Check if any policies need payouts based on weather data
     * @param location Location identifier
     * @param timestamp Unix timestamp
     * @param rainfall Actual rainfall amount
     */
    function _checkPolicyPayouts(uint256 location, uint256 timestamp, uint256 rainfall) internal {
        // This would typically query the policy contract for active policies
        // For now, we'll emit an event that can be listened to off-chain
        // In a production system, this would automatically trigger payouts
        
        // Placeholder for automatic payout logic
        // The policy contract would need to expose a function to query active policies by location
        emit PayoutTriggered(0, location, rainfall, 0); // policyId = 0 for notification
    }
    
    /**
     * @dev Manual payout trigger for testing (owner only)
     * @param policyId ID of the policy
     * @param location Location identifier
     * @param actualRainfall Actual rainfall amount
     * @param threshold Rainfall threshold
     */
    function manualPayoutTrigger(
        uint256 policyId,
        uint256 location,
        uint256 actualRainfall,
        uint256 threshold
    ) external onlyOwner {
        require(actualRainfall < threshold, "Rainfall threshold not breached");
        
        // Call policy contract to trigger payout
        IAgroShieldPolicy(policyContract).triggerPayout(policyId, actualRainfall);
        
        emit PayoutTriggered(policyId, location, actualRainfall, threshold);
    }
    
    /**
     * @dev Get weather data for a specific location and timestamp
     * @param location Location identifier
     * @param timestamp Unix timestamp
     * @return Weather data
     */
    function getWeatherData(uint256 location, uint256 timestamp) 
        external 
        view 
        returns (WeatherData memory) 
    {
        return specificWeatherData[location][timestamp];
    }
    
    /**
     * @dev Get weather history for a location
     * @param location Location identifier
     * @param limit Maximum number of records to return
     * @return Array of weather data
     */
    function getWeatherHistory(uint256 location, uint256 limit) 
        external 
        view 
        returns (WeatherData[] memory) 
    {
        WeatherData[] storage history = locationWeatherHistory[location];
        uint256 length = history.length > limit ? limit : history.length;
        
        WeatherData[] memory result = new WeatherData[](length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = history[history.length - length + i]; // Return most recent
        }
        
        return result;
    }
    
    /**
     * @dev Get latest verified weather data for a location
     * @param location Location identifier
     * @return Latest weather data
     */
    function getLatestWeatherData(uint256 location) external view returns (WeatherData memory) {
        WeatherData[] storage history = locationWeatherHistory[location];
        require(history.length > 0, "No weather data for location");
        
        return history[history.length - 1];
    }
    
    /**
     * @dev Update minimum confirmations required (owner only)
     * @param newMinConfirmations New minimum confirmations
     */
    function updateMinConfirmations(uint256 newMinConfirmations) external onlyOwner {
        require(newMinConfirmations > 0, "Must be greater than 0");
        minConfirmations = newMinConfirmations;
    }
    
    /**
     * @dev Get pending verification count
     * @return Number of pending verifications
     */
    function getPendingVerificationsCount() external view returns (uint256) {
        uint256 count = 0;
        // This is a simplified version - in production, you'd maintain a separate counter
        return count;
    }
}

/**
 * @dev Interface for AgroShieldPolicy
 */
interface IAgroShieldPolicy {
    function triggerPayout(uint256 policyId, uint256 actualRainfall) external;
}
