// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AgroShieldOracle.sol";

contract DynamicPremiums is Ownable, ReentrancyGuard {
    AgroShieldOracle public oracleContract;
    
    constructor(address _oracle) Ownable(msg.sender) {
        oracleContract = AgroShieldOracle(_oracle);
    }
    
    struct RiskFactor {
        string location;
        uint256 baseRiskScore;
        uint256 historicalRainfallVariance;
        uint256 droughtFrequency;
        uint256 floodFrequency;
        uint256 lastUpdated;
        bool isActive;
    }
    
    mapping(string => RiskFactor) public riskFactors;
    string[] public supportedLocations;
    
    event RiskFactorUpdated(string indexed location, uint256 baseRiskScore, uint256 variance, uint256 droughtFreq, uint256 floodFreq);
    
    modifier onlyValidOracle() {
        require(msg.sender == address(oracleContract), "Only oracle can call this function");
        _;
    }
    
    function addRiskFactor(
        string memory _location,
        uint256 _baseRiskScore,
        uint256 _variance,
        uint256 _droughtFreq,
        uint256 _floodFreq
    ) external onlyOwner onlyValidOracle {
        require(bytes(_location).length > 0, "Location cannot be empty");
        
        riskFactors[_location] = RiskFactor({
            location: _location,
            baseRiskScore: _baseRiskScore,
            historicalRainfallVariance: _variance,
            droughtFrequency: _droughtFreq,
            floodFrequency: _floodFreq,
            lastUpdated: block.timestamp,
            isActive: true
        });
        
        // Add to supported locations if new
        bool locationExists = false;
        for (uint256 i = 0; i < supportedLocations.length; i++) {
            if (keccak256(bytes(supportedLocations[i])) == keccak256(bytes(_location))) {
                locationExists = true;
                break;
            }
        }
        
        if (!locationExists) {
            supportedLocations.push(_location);
        }
        
        emit RiskFactorUpdated(_location, _baseRiskScore, _variance, _droughtFreq, _floodFreq);
    }
    
    function getRiskFactor(string memory _location) external view returns (RiskFactor memory) {
        return riskFactors[_location];
    }
    
    function getSupportedLocations() external view returns (string[] memory) {
        return supportedLocations;
    }
    
    function _calculateRiskAdjustment(
        RiskFactor memory _risk,
        uint256 _coverageAmount,
        uint256 _rainfallThreshold,
        uint256 _measurementPeriod
    ) internal pure returns (uint256) {
        // Base risk adjustment
        uint256 riskAdjustment = 0;
        
        // Historical variance factor (higher variance = higher risk)
        if (_risk.historicalRainfallVariance > 500000) { // 5% variance threshold
            riskAdjustment += 200; // +2% premium
        }
        
        // Drought frequency factor
        if (_risk.droughtFrequency > 10) { // More than 10 droughts in measurement period
            riskAdjustment += 300; // +3% premium
        }
        
        // Flood frequency factor
        if (_risk.floodFrequency > 5) { // More than 5 floods in measurement period
            riskAdjustment += 150; // +1.5% premium
        }
        
        return riskAdjustment;
    }
    
    function calculatePremium(
        string memory _location,
        uint256 _coverageAmount,
        uint256 _rainfallThreshold,
        uint256 _measurementPeriod
    ) external view returns (uint256) {
        require(_coverageAmount > 0, "Coverage amount must be greater than 0");
        require(riskFactors[_location].isActive, "Location risk factor not active");
        
        RiskFactor memory locationRisk = riskFactors[_location];
        
        // Base premium calculation (in basis points, 10000 = 100%)
        uint256 basePremium = (_coverageAmount * 150) / 10000; // 1.5% base rate
        
        // Risk multipliers
        uint256 locationFactor = 10000; // 1.0x (neutral location)
        uint256 cropFactor = 10000; // 1.0x (standard crop)
        uint256 seasonalFactor = 11000; // 1.1x (rainy season premium)
        
        // Calculate final premium
        uint256 finalPremium = basePremium
            * locationFactor
            * cropFactor
            * seasonalFactor
            / 1000000 // Normalize for multiple factors
            + _calculateRiskAdjustment(locationRisk, _coverageAmount, _rainfallThreshold, _measurementPeriod);
        
        // Ensure premium is within bounds
        uint256 minPremiumRate = 500; // 5% minimum
        uint256 maxPremiumRate = 5000; // 50% maximum
        
        if (finalPremium < (_coverageAmount * minPremiumRate) / 10000) {
            finalPremium = (_coverageAmount * minPremiumRate) / 10000;
        }
        if (finalPremium > (_coverageAmount * maxPremiumRate) / 10000) {
            finalPremium = (_coverageAmount * maxPremiumRate) / 10000;
        }
        
        return PremiumCalculation({
            basePremium: basePremium,
            riskAdjustment: _calculateRiskAdjustment(locationRisk, _coverageAmount, _rainfallThreshold, _measurementPeriod),
            finalPremium: finalPremium,
            locationRisk: locationRisk.baseRiskScore,
            calculationTimestamp: block.timestamp
        });
    }
    
    struct PremiumCalculation {
        uint256 basePremium;
        uint256 riskAdjustment;
        uint256 finalPremium;
        uint256 locationRisk;
        uint256 calculationTimestamp;
    }
}
