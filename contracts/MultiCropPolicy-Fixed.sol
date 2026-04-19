// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgroShieldPolicy.sol";
import "./AgroShieldOracle.sol";
import "./DynamicPremiums.sol";

contract MultiCropPolicy is ReentrancyGuard, Ownable {
    IERC20 public immutable cusdToken;
    AgroShieldPolicy public policyContract;
    AgroShieldOracle public oracleContract;
    DynamicPremiums public dynamicPremiums;
    
    constructor(address _cusdToken, address _policyContract, address _oracle, address _dynamicPremiums) Ownable(msg.sender) {
        cusdToken = IERC20(_cusdToken);
        policyContract = AgroShieldPolicy(_policyContract);
        oracleContract = AgroShieldOracle(_oracle);
        dynamicPremiums = DynamicPremiums(_dynamicPremiums);
    }
    
    struct CropEntry {
        string cropType;
        uint256 coverageAmount;
        uint256 rainfallThreshold;
        uint256 weight; // Weight in the overall policy (10000 = 100%)
    }
    
    struct MultiCropPolicyData {
        uint256 policyId;
        address farmer;
        uint256 totalCoverage;
        uint256 totalPremium;
        uint256 measurementPeriod;
        uint256 createdAt;
        bool isActive;
        CropEntry[] crops;
    }
    
    mapping(uint256 => MultiCropPolicyData) public multiCropPolicies;
    mapping(address => uint256[]) public farmerPolicies;
    uint256 public policyCounter;
    
    event MultiCropPolicyCreated(
        uint256 indexed policyId,
        address indexed farmer,
        uint256 totalCoverage,
        uint256 totalPremium
    );
    
    event MultiCropPolicyUpdated(
        uint256 indexed policyId,
        string cropType,
        uint256 coverageAmount
    );
    
    function createMultiCropPolicy(
        CropEntry[] memory _crops,
        uint256 _measurementPeriod
    ) external nonReentrant {
        require(_crops.length > 0, "Must specify at least one crop");
        require(_measurementPeriod > 0, "Invalid measurement period");
        
        uint256 totalWeight = 0;
        uint256 totalCoverage = 0;
        uint256 totalPremium = 0;
        
        for (uint256 i = 0; i < _crops.length; i++) {
            totalWeight += _crops[i].weight;
            totalCoverage += _crops[i].coverageAmount;
            
            // Calculate premium for each crop
            uint256 cropPremium = dynamicPremiums.calculatePremium(
                "default_location", // Would be passed in real implementation
                _crops[i].coverageAmount,
                _crops[i].rainfallThreshold,
                _measurementPeriod
            );
            totalPremium += (cropPremium * _crops[i].weight) / 10000;
        }
        
        require(totalWeight == 10000, "Total weight must equal 100%");
        
        // Check user has sufficient cUSD balance
        require(
            cusdToken.balanceOf(msg.sender) >= totalPremium,
            "Insufficient cUSD balance"
        );
        
        // Transfer premium to policy contract
        require(
            cusdToken.transferFrom(msg.sender, address(policyContract), totalPremium),
            "Premium transfer failed"
        );
        
        // Create multi-crop policy
        multiCropPolicies[policyCounter] = MultiCropPolicyData({
            policyId: policyCounter,
            farmer: msg.sender,
            totalCoverage: totalCoverage,
            totalPremium: totalPremium,
            measurementPeriod: _measurementPeriod,
            createdAt: block.timestamp,
            isActive: true,
            crops: _crops
        });
        
        farmerPolicies[msg.sender].push(policyCounter);
        
        emit MultiCropPolicyCreated(policyCounter, msg.sender, totalCoverage, totalPremium);
        
        policyCounter++;
    }
    
    function getMultiCropPolicy(uint256 _policyId) external view returns (MultiCropPolicyData memory) {
        return multiCropPolicies[_policyId];
    }
    
    function getFarmerMultiCropPolicies(address _farmer) external view returns (uint256[] memory) {
        return farmerPolicies[_farmer];
    }
    
    function updateMultiCropPolicy(
        uint256 _policyId,
        CropEntry[] memory _crops
    ) external nonReentrant {
        require(multiCropPolicies[_policyId].farmer == msg.sender, "Not policy owner");
        require(multiCropPolicies[_policyId].isActive, "Policy not active");
        require(_crops.length > 0, "Must specify at least one crop");
        
        uint256 totalWeight = 0;
        for (uint256 i = 0; i < _crops.length; i++) {
            totalWeight += _crops[i].weight;
        }
        
        require(totalWeight == 10000, "Total weight must equal 100%");
        
        multiCropPolicies[_policyId].crops = _crops;
        
        for (uint256 i = 0; i < _crops.length; i++) {
            emit MultiCropPolicyUpdated(_policyId, _crops[i].cropType, _crops[i].coverageAmount);
        }
    }
    
    function deactivateMultiCropPolicy(uint256 _policyId) external nonReentrant {
        require(multiCropPolicies[_policyId].farmer == msg.sender, "Not policy owner");
        require(multiCropPolicies[_policyId].isActive, "Policy already inactive");
        
        multiCropPolicies[_policyId].isActive = false;
    }
}
