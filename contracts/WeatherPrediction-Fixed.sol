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
        oracleContract = AgroShieldOracle(_oracle);
        dynamicPremiums = DynamicPremiums(_dynamicPremiums);
    }
    
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
    
    mapping(uint256 => WeatherPrediction) public predictions;
    mapping(string => uint256[]) public locationPredictions;
    uint256 public predictionCounter;
    
    event PredictionCreated(
        uint256 indexed predictionId,
        string location,
        uint256 predictedRainfall,
        uint256 confidence
    );
    
    event PredictionUpdated(
        uint256 indexed predictionId,
        uint256 newRainfall,
        uint256 newConfidence
    );
    
    event PredictionValidated(
        uint256 indexed predictionId,
        uint256 actualRainfall,
        bool wasAccurate
    );
    
    modifier onlyAuthorizedProvider() {
        require(
            oracleContract.authorizedProviders(msg.sender),
            "Not authorized weather data provider"
        );
        _;
    }
    
    function createPrediction(
        string memory _location,
        uint256 _predictedRainfall,
        uint256 _confidence,
        uint256 _predictionPeriod,
        string memory _dataSource
    ) external onlyAuthorizedProvider nonReentrant {
        require(bytes(_location).length > 0, "Location cannot be empty");
        require(_predictedRainfall > 0, "Rainfall must be positive");
        require(_confidence <= 10000, "Confidence must be <= 10000");
        require(_predictionPeriod > 0, "Period must be positive");
        require(bytes(_dataSource).length > 0, "Data source cannot be empty");
        
        predictions[predictionCounter] = WeatherPrediction({
            location: _location,
            timestamp: block.timestamp,
            predictedRainfall: _predictedRainfall,
            confidence: _confidence,
            predictionPeriod: _predictionPeriod,
            dataSource: _dataSource,
            createdAt: block.timestamp,
            isActive: true
        });
        
        locationPredictions[_location].push(predictionCounter);
        
        emit PredictionCreated(predictionCounter, _location, _predictedRainfall, _confidence);
        
        predictionCounter++;
    }
    
    function updatePrediction(
        uint256 _predictionId,
        uint256 _newRainfall,
        uint256 _newConfidence
    ) external onlyAuthorizedProvider nonReentrant {
        require(predictions[_predictionId].isActive, "Prediction not active");
        require(_newRainfall > 0, "Rainfall must be positive");
        require(_newConfidence <= 10000, "Confidence must be <= 10000");
        
        predictions[_predictionId].predictedRainfall = _newRainfall;
        predictions[_predictionId].confidence = _newConfidence;
        
        emit PredictionUpdated(_predictionId, _newRainfall, _newConfidence);
    }
    
    function validatePrediction(
        uint256 _predictionId,
        uint256 _actualRainfall
    ) external onlyAuthorizedProvider nonReentrant {
        require(predictions[_predictionId].isActive, "Prediction not active");
        
        WeatherPrediction storage prediction = predictions[_predictionId];
        
        // Calculate accuracy (within 10% = accurate)
        bool isAccurate = (_actualRainfall * 90 <= prediction.predictedRainfall * 100) &&
                         (_actualRainfall * 110 >= prediction.predictedRainfall * 100);
        
        prediction.isActive = false;
        
        emit PredictionValidated(_predictionId, _actualRainfall, isAccurate);
    }
    
    function deactivatePrediction(uint256 _predictionId) external onlyAuthorizedProvider nonReentrant {
        require(predictions[_predictionId].isActive, "Prediction already inactive");
        
        predictions[_predictionId].isActive = false;
    }
    
    function getPrediction(uint256 _predictionId) external view returns (WeatherPrediction memory) {
        return predictions[_predictionId];
    }
    
    function getLocationPredictions(string memory _location) external view returns (uint256[] memory) {
        return locationPredictions[_location];
    }
    
    function getActivePredictions() external view returns (uint256[] memory) {
        uint256[] memory activePredictions = new uint256[](predictionCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < predictionCounter; i++) {
            if (predictions[i].isActive) {
                activePredictions[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        assembly {
            mstore(activePredictions, count)
        }
        
        return activePredictions;
    }
    
    function getPredictionAccuracy(string memory _location) external view returns (uint256 accuracy) {
        uint256[] memory locationPreds = locationPredictions[_location];
        uint256 accurateCount = 0;
        uint256 totalCount = 0;
        
        for (uint256 i = 0; i < locationPreds.length; i++) {
            WeatherPrediction memory pred = predictions[locationPreds[i]];
            if (!pred.isActive) {
                totalCount++;
                // Would need actual rainfall data to calculate accuracy
                // This is a placeholder for demonstration
            }
        }
        
        return totalCount > 0 ? (accurateCount * 10000) / totalCount : 0;
    }
}
