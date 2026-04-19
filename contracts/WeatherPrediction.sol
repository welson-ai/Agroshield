// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AgroShieldOracle.sol";
import "./DynamicPremiums.sol";

contract WeatherPrediction is Ownable, ReentrancyGuard {
    AgroShieldOracle public oracleContract;
    DynamicPremiums public dynamicPremiums;
    
    constructor(address _oracle, address _dynamicPremiums) Ownable(msg.sender) {
    
    struct WeatherPrediction {
        string location;
        uint256 timestamp;
        uint256 predictedRainfall;
        uint256 confidence; // 0-10000 basis points
        uint256 predictionPeriod; // Days into future
        string dataSource;
        uint256 createdAt;
        bool isActive;
    }
    
    struct PredictionAccuracy {
        string location;
        uint256 totalPredictions;
        uint256 accuratePredictions;
        uint256 averageError;
        uint256 lastUpdated;
    }
    
    struct PremiumAdjustment {
        uint256 basePremium;
        uint256 predictionAdjustment;
        uint256 finalPremium;
        uint256 confidence;
        string reasoning;
    }
    
    mapping(string => WeatherPrediction[]) public locationPredictions;
    mapping(string => PredictionAccuracy) public predictionAccuracy;
    mapping(uint256 => PremiumAdjustment) public premiumAdjustments;
    
    string[] public supportedLocations;
    uint256 public predictionCounter;
    uint256 public premiumAdjustmentCounter;
    
    uint256 public maxPredictionPeriod = 30; // Max 30 days
    uint256 public minConfidence = 3000; // 30% minimum confidence
    uint256 public predictionWeight = 2000; // 20% weight in premium calculation
    
    event WeatherPredicted(
        string indexed location,
        uint256 timestamp,
        uint256 predictedRainfall,
        uint256 confidence,
        uint256 predictionPeriod
    );
    
    event PredictionValidated(
        string indexed location,
        uint256 predictedRainfall,
        uint256 actualRainfall,
        uint256 accuracy,
        bool wasAccurate
    );
    
    event PremiumAdjusted(
        uint256 indexed policyId,
        uint256 basePremium,
        uint256 finalPremium,
        uint256 adjustment,
        string reasoning
    );
    
    event PredictionWeightUpdated(uint256 oldWeight, uint256 newWeight);
    event MinConfidenceUpdated(uint256 oldMin, uint256 newMin);
    
    modifier validLocation(string memory _location) {
        require(bytes(_location).length > 0, "Invalid location");
        _;
    }
    
    modifier authorizedOracle() {
        require(
            msg.sender == owner() || oracleContract.isAuthorizedOracle(msg.sender),
            "Not authorized"
        );
        _;
    }
    
    constructor(address _oracleContract, address _dynamicPremiums) {
        oracleContract = AgroShieldOracle(_oracleContract);
        dynamicPremiums = DynamicPremiums(_dynamicPremiums);
        
        // Initialize with supported locations
        _initializeSupportedLocations();
    }
    
    function submitWeatherPrediction(
        string memory _location,
        uint256 _timestamp,
        uint256 _predictedRainfall,
        uint256 _confidence,
        uint256 _predictionPeriod,
        string memory _dataSource
    ) external authorizedOracle validLocation(_location) nonReentrant {
        require(_timestamp > block.timestamp, "Timestamp must be in future");
        require(_confidence <= 10000, "Confidence too high");
        require(_predictionPeriod > 0 && _predictionPeriod <= maxPredictionPeriod, "Invalid period");
        require(bytes(_dataSource).length > 0, "Invalid data source");
        
        // Create prediction
        WeatherPrediction memory prediction = WeatherPrediction({
            location: _location,
            timestamp: _timestamp,
            predictedRainfall: _predictedRainfall,
            confidence: _confidence,
            predictionPeriod: _predictionPeriod,
            dataSource: _dataSource,
            createdAt: block.timestamp,
            isActive: true
        });
        
        locationPredictions[_location].push(prediction);
        predictionCounter++;
        
        // Add to supported locations if new
        if (!_isLocationSupported(_location)) {
            supportedLocations.push(_location);
        }
        
        emit WeatherPredicted(
            _location,
            _timestamp,
            _predictedRainfall,
            _confidence,
            _predictionPeriod
        );
    }
    
    function validatePrediction(
        string memory _location,
        uint256 _predictionIndex,
        uint256 _actualRainfall
    ) external authorizedOracle validLocation(_location) nonReentrant {
        require(_predictionIndex < locationPredictions[_location].length, "Invalid prediction index");
        
        WeatherPrediction storage prediction = locationPredictions[_location][_predictionIndex];
        require(prediction.isActive, "Prediction not active");
        require(block.timestamp >= prediction.timestamp, "Prediction period not reached");
        
        // Calculate accuracy
        uint256 error = _calculatePredictionError(prediction.predictedRainfall, _actualRainfall);
        bool isAccurate = error <= 2000; // Within 20% is considered accurate
        
        // Update accuracy tracking
        PredictionAccuracy storage accuracy = predictionAccuracy[_location];
        accuracy.totalPredictions++;
        if (isAccurate) {
            accuracy.accuratePredictions++;
        }
        
        // Update average error
        accuracy.averageError = (accuracy.averageError * (accuracy.totalPredictions - 1) + error) / accuracy.totalPredictions;
        accuracy.lastUpdated = block.timestamp;
        
        // Deactivate prediction
        prediction.isActive = false;
        
        emit PredictionValidated(
            _location,
            prediction.predictedRainfall,
            _actualRainfall,
            error,
            isAccurate
        );
    }
    
    function calculatePremiumWithPrediction(
        uint256 _coverageAmount,
        string memory _location,
        string memory _cropType,
        uint256 _measurementPeriod,
        uint256 _rainfallThreshold
    ) external view returns (PremiumAdjustment memory) {
        // Get base premium from dynamic premiums
        DynamicPremiums.PremiumCalculation memory baseCalc = dynamicPremiums.calculateDynamicPremium(
            _coverageAmount,
            _location,
            _cropType,
            _measurementPeriod,
            _rainfallThreshold
        );
        
        // Get relevant predictions
        WeatherPrediction[] memory predictions = _getRelevantPredictions(_location, _measurementPeriod);
        
        uint256 predictionAdjustment = 0;
        uint256 totalConfidence = 0;
        string memory reasoning = "Base premium calculation";
        
        if (predictions.length > 0) {
            (predictionAdjustment, totalConfidence, reasoning) = _calculatePredictionAdjustment(
                predictions,
                _rainfallThreshold,
                baseCalc.finalPremium
            );
        }
        
        uint256 finalPremium = baseCalc.finalPremium.add(predictionAdjustment);
        
        return PremiumAdjustment({
            basePremium: baseCalc.finalPremium,
            predictionAdjustment: predictionAdjustment,
            finalPremium: finalPremium,
            confidence: totalConfidence / predictions.length,
            reasoning: reasoning
        });
    }
    
    function recordPremiumAdjustment(
        uint256 _policyId,
        PremiumAdjustment memory _adjustment
    ) external nonReentrant {
        premiumAdjustmentCounter++;
        premiumAdjustments[premiumAdjustmentCounter] = _adjustment;
        
        emit PremiumAdjusted(
            _policyId,
            _adjustment.basePremium,
            _adjustment.finalPremium,
            _adjustment.predictionAdjustment,
            _adjustment.reasoning
        );
    }
    
    function getLocationPredictions(string memory _location) external view returns (WeatherPrediction[] memory) {
        return locationPredictions[_location];
    }
    
    function getActivePredictions(string memory _location) external view returns (WeatherPrediction[] memory) {
        WeatherPrediction[] memory allPredictions = locationPredictions[_location];
        uint256 activeCount = 0;
        
        // Count active predictions
        for (uint256 i = 0; i < allPredictions.length; i++) {
            if (allPredictions[i].isActive && allPredictions[i].timestamp > block.timestamp) {
                activeCount++;
            }
        }
        
        // Filter active predictions
        WeatherPrediction[] memory activePredictions = new WeatherPrediction[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allPredictions.length; i++) {
            if (allPredictions[i].isActive && allPredictions[i].timestamp > block.timestamp) {
                activePredictions[index] = allPredictions[i];
                index++;
            }
        }
        
        return activePredictions;
    }
    
    function getPredictionAccuracy(string memory _location) external view returns (PredictionAccuracy memory) {
        return predictionAccuracy[_location];
    }
    
    function getPremiumAdjustment(uint256 _adjustmentId) external view returns (PremiumAdjustment memory) {
        return premiumAdjustments[_adjustmentId];
    }
    
    function getSupportedLocations() external view returns (string[] memory) {
        return supportedLocations;
    }
    
    function getPredictionStats() external view returns (
        uint256 totalPredictions,
        uint256 activePredictions,
        uint256 averageAccuracy,
        uint256 locationsCovered
    ) {
        uint256 total = 0;
        uint256 active = 0;
        uint256 accurate = 0;
        uint256 locations = supportedLocations.length;
        
        for (uint256 i = 0; i < supportedLocations.length; i++) {
            string memory location = supportedLocations[i];
            WeatherPrediction[] memory preds = locationPredictions[location];
            
            total += preds.length;
            
            for (uint256 j = 0; j < preds.length; j++) {
                if (preds[j].isActive && preds[j].timestamp > block.timestamp) {
                    active++;
                }
            }
            
            if (predictionAccuracy[location].totalPredictions > 0) {
                accurate += predictionAccuracy[location].accuratePredictions;
            }
        }
        
        uint256 avgAccuracy = total > 0 ? (accurate * 10000) / total : 0;
        
        return (total, active, avgAccuracy, locations);
    }
    
    function setPredictionWeight(uint256 _newWeight) external onlyOwner {
        require(_newWeight <= 5000, "Weight too high"); // Max 50%
        
        uint256 oldWeight = predictionWeight;
        predictionWeight = _newWeight;
        
        emit PredictionWeightUpdated(oldWeight, _newWeight);
    }
    
    function setMinConfidence(uint256 _newMin) external onlyOwner {
        require(_newMin <= 10000, "Min confidence too high");
        
        uint256 oldMin = minConfidence;
        minConfidence = _newMin;
        
        emit MinConfidenceUpdated(oldMin, _newMin);
    }
    
    function setMaxPredictionPeriod(uint256 _newMax) external onlyOwner {
        require(_newMax > 0 && _newMax <= 365, "Invalid max period");
        maxPredictionPeriod = _newMax;
    }
    
    function addSupportedLocation(string memory _location) external onlyOwner {
        if (!_isLocationSupported(_location)) {
            supportedLocations.push(_location);
        }
    }
    
    function removeSupportedLocation(string memory _location) external onlyOwner {
        for (uint256 i = 0; i < supportedLocations.length; i++) {
            if (keccak256(bytes(supportedLocations[i])) == keccak256(bytes(_location))) {
                supportedLocations[i] = supportedLocations[supportedLocations.length - 1];
                supportedLocations.pop();
                break;
            }
        }
    }
    
    function _getRelevantPredictions(string memory _location, uint256 _measurementPeriod) internal view returns (WeatherPrediction[] memory) {
        WeatherPrediction[] memory allPredictions = locationPredictions[_location];
        uint256 relevantCount = 0;
        
        // Count relevant predictions
        for (uint256 i = 0; i < allPredictions.length; i++) {
            if (allPredictions[i].isActive && 
                allPredictions[i].predictionPeriod <= _measurementPeriod &&
                allPredictions[i].confidence >= minConfidence) {
                relevantCount++;
            }
        }
        
        // Filter relevant predictions
        WeatherPrediction[] memory relevantPredictions = new WeatherPrediction[](relevantCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allPredictions.length; i++) {
            if (allPredictions[i].isActive && 
                allPredictions[i].predictionPeriod <= _measurementPeriod &&
                allPredictions[i].confidence >= minConfidence) {
                relevantPredictions[index] = allPredictions[i];
                index++;
            }
        }
        
        return relevantPredictions;
    }
    
    function _calculatePredictionAdjustment(
        WeatherPrediction[] memory _predictions,
        uint256 _rainfallThreshold,
        uint256 _basePremium
    ) internal view returns (uint256 adjustment, uint256 totalConfidence, string memory reasoning) {
        if (_predictions.length == 0) {
            return (0, 0, "No relevant predictions available");
        }
        
        uint256 totalWeightedAdjustment = 0;
        totalConfidence = 0;
        
        for (uint256 i = 0; i < _predictions.length; i++) {
            WeatherPrediction memory prediction = _predictions[i];
            
            // Calculate adjustment based on prediction vs threshold
            uint256 predictionDiff = 0;
            if (prediction.predictedRainfall < _rainfallThreshold) {
                // Predicted rainfall below threshold - higher risk
                predictionDiff = (_rainfallThreshold - prediction.predictedRainfall) * 10000 / _rainfallThreshold;
            } else {
                // Predicted rainfall above threshold - lower risk
                predictionDiff = (prediction.predictedRainfall - _rainfallThreshold) * 10000 / _rainfallThreshold;
                predictionDiff = predictionDiff > 5000 ? 5000 : predictionDiff; // Cap at 50% reduction
            }
            
            // Weight by confidence
            uint256 weightedAdjustment = (predictionDiff * prediction.confidence) / 10000;
            totalWeightedAdjustment += weightedAdjustment;
            totalConfidence += prediction.confidence;
        }
        
        // Average the adjustments
        uint256 avgAdjustment = totalWeightedAdjustment / _predictions.length;
        
        // Apply prediction weight to premium
        adjustment = (_basePremium * avgAdjustment * predictionWeight) / (10000 * 10000);
        
        // Generate reasoning
        if (avgAdjustment > 0) {
            reasoning = "Premium increased due to drought risk prediction";
        } else {
            reasoning = "Premium reduced due to favorable rainfall prediction";
        }
    }
    
    function _calculatePredictionError(uint256 _predicted, uint256 _actual) internal pure returns (uint256) {
        if (_predicted == 0) return _actual > 0 ? 10000 : 0;
        
        uint256 diff = _predicted > _actual ? _predicted - _actual : _actual - _predicted;
        return (diff * 10000) / _predicted;
    }
    
    function _isLocationSupported(string memory _location) internal view returns (bool) {
        for (uint256 i = 0; i < supportedLocations.length; i++) {
            if (keccak256(bytes(supportedLocations[i])) == keccak256(bytes(_location))) {
                return true;
            }
        }
        return false;
    }
    
    function _initializeSupportedLocations() internal {
        // Initialize with Kenya locations from AgroShield
        supportedLocations.push("1.0152,35.0069"); // Kitale
        supportedLocations.push("0.4236,37.0643"); // Nyeri
        supportedLocations.push("-0.3684,35.2850"); // Kericho
        supportedLocations.push("-0.7484,37.3544"); // Mwea
        supportedLocations.push("-1.0781,35.5695"); // Narok
    }
}
