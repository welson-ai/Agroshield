// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AgroShieldOracle.sol";

contract DynamicPremiums is Ownable, ReentrancyGuard {
    AgroShieldOracle public oracleContract;
    
    constructor(address _oracle) Ownable(msg.sender) {
    
    struct RiskFactor {
        string location;
        uint256 baseRiskScore;
        uint256 historicalRainfallVariance;
        uint256 droughtFrequency;
        uint256 floodFrequency;
        uint256 lastUpdated;
        bool isActive;
    }
    
    struct CropRiskProfile {
        string cropType;
        uint256 riskMultiplier;
        uint256 basePremiumRate;
        uint256 sensitivityFactor;
        bool isActive;
    }
    
    struct PremiumCalculation {
        uint256 basePremium;
        uint256 riskAdjustment;
        uint256 locationFactor;
        uint256 cropFactor;
        uint256 seasonalFactor;
        uint256 finalPremium;
        uint256 calculatedAt;
    }
    
    mapping(string => RiskFactor) public locationRiskFactors;
    mapping(string => CropRiskProfile) public cropRiskProfiles;
    mapping(uint256 => PremiumCalculation) public premiumHistory;
    
    string[] public activeLocations;
    string[] public activeCrops;
    
    uint256 public basePremiumRate = 1000; // 10% in basis points
    uint256 public maxPremiumRate = 3000; // 30% in basis points
    uint256 public minPremiumRate = 500;   // 5% in basis points
    
    uint256 public premiumCalculationCounter;
    
    event LocationRiskFactorUpdated(
        string indexed location,
        uint256 riskScore,
        uint256 variance,
        uint256 droughtFreq,
        uint256 floodFreq
    );
    
    event CropRiskProfileUpdated(
        string indexed cropType,
        uint256 riskMultiplier,
        uint256 premiumRate,
        uint256 sensitivity
    );
    
    event PremiumCalculated(
        uint256 indexed policyId,
        uint256 basePremium,
        uint256 finalPremium,
        uint256 riskScore
    );
    
    event BasePremiumRateUpdated(uint256 oldRate, uint256 newRate);
    
    modifier validLocation(string memory _location) {
        require(bytes(_location).length > 0, "Invalid location");
        require(locationRiskFactors[_location].isActive, "Location not supported");
        _;
    }
    
    modifier validCrop(string memory _cropType) {
        require(bytes(_cropType).length > 0, "Invalid crop type");
        require(cropRiskProfiles[_cropType].isActive, "Crop not supported");
        _;
    }
    
    constructor(address _oracleContract) {
        oracleContract = AgroShieldOracle(_oracleContract);
        
        // Initialize with default crop profiles
        _initializeDefaultCropProfiles();
        
        // Initialize with default location risk factors
        _initializeDefaultLocationFactors();
    }
    
    function calculateDynamicPremium(
        uint256 _coverageAmount,
        string memory _location,
        string memory _cropType,
        uint256 _measurementPeriod,
        uint256 _rainfallThreshold
    ) external view returns (PremiumCalculation memory) {
        require(_coverageAmount > 0, "Invalid coverage amount");
        require(_measurementPeriod > 0, "Invalid measurement period");
        require(_rainfallThreshold > 0, "Invalid rainfall threshold");
        
        // Calculate base premium
        uint256 basePremium = (_coverageAmount * basePremiumRate) / 10000;
        
        // Apply location risk factor
        RiskFactor memory locationRisk = locationRiskFactors[_location];
        uint256 locationFactor = _calculateLocationFactor(locationRisk, _rainfallThreshold);
        
        // Apply crop risk profile
        CropRiskProfile memory cropProfile = cropRiskProfiles[_cropType];
        uint256 cropFactor = cropProfile.riskMultiplier;
        
        // Apply seasonal factor based on measurement period
        uint256 seasonalFactor = _calculateSeasonalFactor(_measurementPeriod);
        
        // Calculate risk adjustment
        uint256 riskAdjustment = _calculateRiskAdjustment(
            locationRisk,
            cropProfile,
            _rainfallThreshold,
            _measurementPeriod
        );
        
        // Calculate final premium
        uint256 finalPremium = basePremium
            * locationFactor
            * cropFactor
            * seasonalFactor
            / 1000000 // Normalize for multiple factors
            + riskAdjustment;
        
        // Ensure premium is within bounds
        if (finalPremium < (_coverageAmount * minPremiumRate) / 10000) {
            finalPremium = (_coverageAmount * minPremiumRate) / 10000;
        }
        if (finalPremium > (_coverageAmount * maxPremiumRate) / 10000) {
            finalPremium = (_coverageAmount * maxPremiumRate) / 10000;
        }
        
        return PremiumCalculation({
            basePremium: basePremium,
            riskAdjustment: riskAdjustment,
            locationFactor: locationFactor,
            cropFactor: cropFactor,
            seasonalFactor: seasonalFactor,
            finalPremium: finalPremium,
            calculatedAt: block.timestamp
        });
    }
    
    function recordPremiumCalculation(
        uint256 _policyId,
        PremiumCalculation memory _calculation
    ) external nonReentrant {
        premiumCalculationCounter++;
        premiumHistory[premiumCalculationCounter] = _calculation;
        
        emit PremiumCalculated(
            _policyId,
            _calculation.basePremium,
            _calculation.finalPremium,
            _calculation.riskAdjustment
        );
    }
    
    function updateLocationRiskFactor(
        string memory _location,
        uint256 _riskScore,
        uint256 _variance,
        uint256 _droughtFreq,
        uint256 _floodFreq
    ) external onlyOwner {
        require(_riskScore <= 10000, "Risk score too high");
        require(_variance <= 10000, "Variance too high");
        
        bool isNew = !locationRiskFactors[_location].isActive;
        
        locationRiskFactors[_location] = RiskFactor({
            location: _location,
            baseRiskScore: _riskScore,
            historicalRainfallVariance: _variance,
            droughtFrequency: _droughtFreq,
            floodFrequency: _floodFreq,
            lastUpdated: block.timestamp,
            isActive: true
        });
        
        if (isNew) {
            activeLocations.push(_location);
        }
        
        emit LocationRiskFactorUpdated(_location, _riskScore, _variance, _droughtFreq, _floodFreq);
    }
    
    function updateCropRiskProfile(
        string memory _cropType,
        uint256 _riskMultiplier,
        uint256 _premiumRate,
        uint256 _sensitivityFactor
    ) external onlyOwner {
        require(_riskMultiplier <= 20000, "Risk multiplier too high");
        require(_premiumRate <= 10000, "Premium rate too high");
        
        bool isNew = !cropRiskProfiles[_cropType].isActive;
        
        cropRiskProfiles[_cropType] = CropRiskProfile({
            cropType: _cropType,
            riskMultiplier: _riskMultiplier,
            basePremiumRate: _premiumRate,
            sensitivityFactor: _sensitivityFactor,
            isActive: true
        });
        
        if (isNew) {
            activeCrops.push(_cropType);
        }
        
        emit CropRiskProfileUpdated(_cropType, _riskMultiplier, _premiumRate, _sensitivityFactor);
    }
    
    function setBasePremiumRate(uint256 _newRate) external onlyOwner {
        require(_newRate >= minPremiumRate && _newRate <= maxPremiumRate, "Rate out of bounds");
        
        uint256 oldRate = basePremiumRate;
        basePremiumRate = _newRate;
        
        emit BasePremiumRateUpdated(oldRate, _newRate);
    }
    
    function setPremiumBounds(
        uint256 _minRate,
        uint256 _maxRate
    ) external onlyOwner {
        require(_minRate < _maxRate, "Invalid bounds");
        require(_maxRate <= 10000, "Max rate too high");
        
        minPremiumRate = _minRate;
        maxPremiumRate = _maxRate;
    }
    
    function getLocationRiskFactor(string memory _location) external view returns (RiskFactor memory) {
        return locationRiskFactors[_location];
    }
    
    function getCropRiskProfile(string memory _cropType) external view returns (CropRiskProfile memory) {
        return cropRiskProfiles[_cropType];
    }
    
    function getPremiumCalculation(uint256 _calculationId) external view returns (PremiumCalculation memory) {
        return premiumHistory[_calculationId];
    }
    
    function getActiveLocations() external view returns (string[] memory) {
        return activeLocations;
    }
    
    function getActiveCrops() external view returns (string[] memory) {
        return activeCrops;
    }
    
    function getLatestPremiumCalculations(uint256 _count) external view returns (PremiumCalculation[] memory) {
        uint256 start = premiumCalculationCounter > _count ? premiumCalculationCounter - _count : 0;
        uint256 length = premiumCalculationCounter - start + 1;
        
        PremiumCalculation[] memory calculations = new PremiumCalculation[](length);
        
        for (uint256 i = 0; i < length; i++) {
            calculations[i] = premiumHistory[start + i];
        }
        
        return calculations;
    }
    
    function deactiveLocationRiskFactor(string memory _location) external onlyOwner {
        require(locationRiskFactors[_location].isActive, "Location already inactive");
        
        locationRiskFactors[_location].isActive = false;
        
        // Remove from active locations array
        for (uint256 i = 0; i < activeLocations.length; i++) {
            if (keccak256(bytes(activeLocations[i])) == keccak256(bytes(_location))) {
                activeLocations[i] = activeLocations[activeLocations.length - 1];
                activeLocations.pop();
                break;
            }
        }
    }
    
    function deactivateCropRiskProfile(string memory _cropType) external onlyOwner {
        require(cropRiskProfiles[_cropType].isActive, "Crop already inactive");
        
        cropRiskProfiles[_cropType].isActive = false;
        
        // Remove from active crops array
        for (uint256 i = 0; i < activeCrops.length; i++) {
            if (keccak256(bytes(activeCrops[i])) == keccak256(bytes(_cropType))) {
                activeCrops[i] = activeCrops[activeCrops.length - 1];
                activeCrops.pop();
                break;
            }
        }
    }
    
    function _calculateLocationFactor(
        RiskFactor memory _risk,
        uint256 _rainfallThreshold
    ) internal pure returns (uint256) {
        // Higher risk score increases premium
        uint256 baseFactor = 10000 + _risk.baseRiskScore;
        
        // Adjust based on rainfall variance
        uint256 varianceAdjustment = (_risk.historicalRainfallVariance * 50) / 10000; // Up to 50% adjustment
        
        // Adjust based on threshold vs historical patterns
        uint256 thresholdAdjustment = 0;
        if (_rainfallThreshold < 50) {
            thresholdAdjustment = _risk.droughtFrequency * 30 / 100; // Drought-prone areas
        } else if (_rainfallThreshold > 100) {
            thresholdAdjustment = _risk.floodFrequency * 30 / 100; // Flood-prone areas
        }
        
        return baseFactor + varianceAdjustment + thresholdAdjustment;
    }
    
    function _calculateSeasonalFactor(uint256 _measurementPeriod) internal pure returns (uint256) {
        // Longer periods have slightly higher risk
        if (_measurementPeriod <= 30) {
            return 9500; // 5% discount for short periods
        } else if (_measurementPeriod <= 90) {
            return 10000; // Normal rate
        } else if (_measurementPeriod <= 180) {
            return 10500; // 5% premium for medium periods
        } else {
            return 11000; // 10% premium for long periods
        }
    }
    
    function _calculateRiskAdjustment(
        RiskFactor memory _locationRisk,
        CropRiskProfile memory _cropProfile,
        uint256 _rainfallThreshold,
        uint256 _measurementPeriod
    ) internal pure returns (uint256) {
        uint256 adjustment = 0;
        
        // Location-based adjustment
        adjustment += (_locationRisk.baseRiskScore * _cropProfile.sensitivityFactor) / 10000;
        
        // Threshold-based adjustment
        if (_rainfallThreshold < 30) {
            adjustment += 100; // Very low threshold risk
        } else if (_rainfallThreshold > 150) {
            adjustment += 50; // High threshold risk
        }
        
        // Period-based adjustment
        if (_measurementPeriod > 180) {
            adjustment += 75; // Long period risk
        }
        
        return adjustment;
    }
    
    function _initializeDefaultCropProfiles() internal {
        // Maize - Medium risk, common crop
        cropRiskProfiles["Maize"] = CropRiskProfile({
            cropType: "Maize",
            riskMultiplier: 11000, // 1.1x
            basePremiumRate: 1000, // 10%
            sensitivityFactor: 8000, // 80% sensitivity
            isActive: true
        });
        activeCrops.push("Maize");
        
        // Coffee - High risk, sensitive crop
        cropRiskProfiles["Coffee"] = CropRiskProfile({
            cropType: "Coffee",
            riskMultiplier: 15000, // 1.5x
            basePremiumRate: 1200, // 12%
            sensitivityFactor: 12000, // 120% sensitivity
            isActive: true
        });
        activeCrops.push("Coffee");
        
        // Tea - Medium-high risk
        cropRiskProfiles["Tea"] = CropRiskProfile({
            cropType: "Tea",
            riskMultiplier: 13000, // 1.3x
            basePremiumRate: 1100, // 11%
            sensitivityFactor: 10000, // 100% sensitivity
            isActive: true
        });
        activeCrops.push("Tea");
        
        // Rice - High risk, water-dependent
        cropRiskProfiles["Rice"] = CropRiskProfile({
            cropType: "Rice",
            riskMultiplier: 14000, // 1.4x
            basePremiumRate: 1300, // 13%
            sensitivityFactor: 11000, // 110% sensitivity
            isActive: true
        });
        activeCrops.push("Rice");
        
        // Wheat - Low-medium risk
        cropRiskProfiles["Wheat"] = CropRiskProfile({
            cropType: "Wheat",
            riskMultiplier: 10500, // 1.05x
            basePremiumRate: 900, // 9%
            sensitivityFactor: 7000, // 70% sensitivity
            isActive: true
        });
        activeCrops.push("Wheat");
    }
    
    function _initializeDefaultLocationFactors() internal {
        // Kitale, Trans-Nzoia - Medium risk, good rainfall
        locationRiskFactors["1.0152,35.0069"] = RiskFactor({
            location: "1.0152,35.0069",
            baseRiskScore: 3000, // 30% risk
            historicalRainfallVariance: 2000, // 20% variance
            droughtFrequency: 1500, // 15% frequency
            floodFrequency: 1000, // 10% frequency
            lastUpdated: block.timestamp,
            isActive: true
        });
        activeLocations.push("1.0152,35.0069");
        
        // Nyeri, Nyeri County - High rainfall variance
        locationRiskFactors["0.4236,37.0643"] = RiskFactor({
            location: "0.4236,37.0643",
            baseRiskScore: 4000, // 40% risk
            historicalRainfallVariance: 3500, // 35% variance
            droughtFrequency: 2000, // 20% frequency
            floodFrequency: 2500, // 25% frequency
            lastUpdated: block.timestamp,
            isActive: true
        });
        activeLocations.push("0.4236,37.0643");
        
        // Kericho, Kericho County - Very high rainfall
        locationRiskFactors["-0.3684,35.2850"] = RiskFactor({
            location: "-0.3684,35.2850",
            baseRiskScore: 3500, // 35% risk
            historicalRainfallVariance: 2500, // 25% variance
            droughtFrequency: 1000, // 10% frequency
            floodFrequency: 3000, // 30% frequency
            lastUpdated: block.timestamp,
            isActive: true
        });
        activeLocations.push("-0.3684,35.2850");
        
        // Mwea, Kirinyaga County - Rice growing area
        locationRiskFactors["-0.7484,37.3544"] = RiskFactor({
            location: "-0.7484,37.3544",
            baseRiskScore: 4500, // 45% risk
            historicalRainfallVariance: 3000, // 30% variance
            droughtFrequency: 2500, // 25% frequency
            floodFrequency: 2000, // 20% frequency
            lastUpdated: block.timestamp,
            isActive: true
        });
        activeLocations.push("-0.7484,37.3544");
        
        // Narok, Narok County - Semi-arid
        locationRiskFactors["-1.0781,35.5695"] = RiskFactor({
            location: "-1.0781,35.5695",
            baseRiskScore: 5000, // 50% risk
            historicalRainfallVariance: 4000, // 40% variance
            droughtFrequency: 4000, // 40% frequency
            floodFrequency: 500, // 5% frequency
            lastUpdated: block.timestamp,
            isActive: true
        });
        activeLocations.push("-1.0781,35.5695");
    }
}
