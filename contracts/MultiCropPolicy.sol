// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgroShieldPolicy.sol";
import "./AgroShieldOracle.sol";
import "./DynamicPremiums.sol";

contract MultiCropPolicy is ReentrancyGuard, Ownable {
    IERC20 public cUSDToken;
    AgroShieldPolicy public policyContract;
    AgroShieldOracle public oracleContract;
    DynamicPremiums public dynamicPremiums;
    
    struct CropEntry {
        string cropType;
        uint256 coverageAmount;
        uint256 rainfallThreshold;
        uint256 weight; // Weight in the overall policy (10000 = 100%)
    }
    
    struct MultiCropPolicyData {
        uint256 policyId;
        address farmer;
        CropEntry[] crops;
        uint256 totalCoverage;
        uint256 totalPremium;
        string location;
        uint256 measurementPeriod;
        uint256 createdAt;
        uint256 premiumPaidAt;
        bool isActive;
        bool isPaid;
        string description;
    }
    
    mapping(uint256 => MultiCropPolicyData) public multiCropPolicies;
    mapping(uint256 => mapping(uint256 => bool)) public cropPayoutStatus; // policyId -> cropIndex -> paid
    mapping(address => uint256[]) public farmerMultiCropPolicies;
    
    uint256 public multiCropPolicyCounter;
    uint256 public maxCropsPerPolicy = 10;
    uint256 public bundleDiscount = 500; // 5% discount in basis points
    
    event MultiCropPolicyCreated(
        uint256 indexed policyId,
        address indexed farmer,
        uint256 totalCoverage,
        uint256 totalPremium,
        uint256 cropCount
    );
    
    event MultiCropPremiumPaid(
        uint256 indexed policyId,
        address indexed farmer,
        uint256 premiumAmount
    );
    
    event CropPayoutProcessed(
        uint256 indexed policyId,
        uint256 indexed cropIndex,
        string cropType,
        address indexed farmer,
        uint256 payoutAmount
    );
    
    event MultiCropPolicyDeactivated(
        uint256 indexed policyId,
        address indexed farmer
    );
    
    event BundleDiscountUpdated(uint256 oldDiscount, uint256 newDiscount);
    event MaxCropsUpdated(uint256 oldMax, uint256 newMax);
    
    modifier onlyPolicyOwner(uint256 _policyId) {
        require(
            multiCropPolicies[_policyId].farmer == msg.sender,
            "Not the policy owner"
        );
        _;
    }
    
    modifier validMultiCropPolicy(uint256 _policyId) {
        require(
            _policyId > 0 && _policyId <= multiCropPolicyCounter,
            "Invalid policy ID"
        );
        require(multiCropPolicies[_policyId].isActive, "Policy not active");
        _;
    }
    
    constructor(
        address _cUSDToken,
        address _policyContract,
        address _oracleContract,
        address _dynamicPremiums
    ) {
        cUSDToken = IERC20(_cUSDToken);
        policyContract = AgroShieldPolicy(_policyContract);
        oracleContract = AgroShieldOracle(_oracleContract);
        dynamicPremiums = DynamicPremiums(_dynamicPremiums);
    }
    
    function createMultiCropPolicy(
        CropEntry[] memory _crops,
        string memory _location,
        uint256 _measurementPeriod,
        string memory _description
    ) external nonReentrant returns (uint256) {
        require(_crops.length > 0, "Must include at least one crop");
        require(_crops.length <= maxCropsPerPolicy, "Too many crops");
        require(bytes(_location).length > 0, "Invalid location");
        require(_measurementPeriod > 0, "Invalid measurement period");
        require(bytes(_description).length > 0, "Invalid description");
        
        // Validate crop entries
        uint256 totalWeight = 0;
        uint256 totalCoverage = 0;
        
        for (uint256 i = 0; i < _crops.length; i++) {
            require(bytes(_crops[i].cropType).length > 0, "Invalid crop type");
            require(_crops[i].coverageAmount > 0, "Invalid coverage amount");
            require(_crops[i].rainfallThreshold > 0, "Invalid rainfall threshold");
            require(_crops[i].weight > 0 && _crops[i].weight <= 10000, "Invalid weight");
            
            totalWeight += _crops[i].weight;
            totalCoverage += _crops[i].coverageAmount;
        }
        
        require(totalWeight == 10000, "Total weight must equal 100%");
        
        // Calculate premiums for each crop
        uint256 totalPremium = 0;
        for (uint256 i = 0; i < _crops.length; i++) {
            DynamicPremiums.PremiumCalculation memory calc = dynamicPremiums.calculateDynamicPremium(
                _crops[i].coverageAmount,
                _location,
                _crops[i].cropType,
                _measurementPeriod,
                _crops[i].rainfallThreshold
            );
            
            totalPremium += calc.finalPremium;
        }
        
        // Apply bundle discount
        uint256 discountAmount = (totalPremium * bundleDiscount) / 10000;
        totalPremium = totalPremium - discountAmount;
        
        // Create multi-crop policy
        uint256 policyId = ++multiCropPolicyCounter;
        
        multiCropPolicies[policyId] = MultiCropPolicyData({
            policyId: policyId,
            farmer: msg.sender,
            crops: _crops,
            totalCoverage: totalCoverage,
            totalPremium: totalPremium,
            location: _location,
            measurementPeriod: _measurementPeriod,
            createdAt: block.timestamp,
            premiumPaidAt: 0,
            isActive: true,
            isPaid: false,
            description: _description
        });
        
        // Track farmer's policies
        farmerMultiCropPolicies[msg.sender].push(policyId);
        
        emit MultiCropPolicyCreated(
            policyId,
            msg.sender,
            totalCoverage,
            totalPremium,
            _crops.length
        );
        
        return policyId;
    }
    
    function payMultiCropPremium(uint256 _policyId) external payable onlyPolicyOwner(_policyId) nonReentrant {
        MultiCropPolicyData storage policy = multiCropPolicies[_policyId];
        
        require(!policy.isPaid, "Premium already paid");
        require(msg.value >= policy.totalPremium, "Insufficient premium payment");
        
        // Transfer premium
        require(
            cUSDToken.transferFrom(msg.sender, address(this), policy.totalPremium),
            "Premium transfer failed"
        );
        
        // Update policy status
        policy.isPaid = true;
        policy.premiumPaidAt = block.timestamp;
        
        // Refund excess payment
        if (msg.value > policy.totalPremium) {
            uint256 refund = msg.value - policy.totalPremium;
            require(cUSDToken.transfer(msg.sender, refund), "Refund failed");
        }
        
        emit MultiCropPremiumPaid(_policyId, msg.sender, policy.totalPremium);
    }
    
    function processCropPayout(uint256 _policyId, uint256 _cropIndex) external nonReentrant {
        validMultiCropPolicy(_policyId)();
        
        MultiCropPolicyData storage policy = multiCropPolicies[_policyId];
        
        require(_cropIndex < policy.crops.length, "Invalid crop index");
        require(!cropPayoutStatus[_policyId][_cropIndex], "Crop payout already processed");
        require(policy.isPaid, "Premium not paid");
        
        CropEntry storage crop = policy.crops[_cropIndex];
        
        // Check weather data for the location
        AgroShieldOracle.WeatherData memory weatherData = oracleContract.getWeatherData(policy.location);
        require(weatherData.verified, "Weather data not available");
        
        // Determine if payout is triggered
        bool shouldPayout = false;
        if (weatherData.rainfall < crop.rainfallThreshold) {
            shouldPayout = true;
        }
        
        // Process payout if triggered
        if (shouldPayout) {
            uint256 payoutAmount = crop.coverageAmount;
            
            // Check if this contract has sufficient funds
            require(
                cUSDToken.balanceOf(address(this)) >= payoutAmount,
                "Insufficient funds for payout"
            );
            
            // Mark as paid
            cropPayoutStatus[_policyId][_cropIndex] = true;
            
            // Transfer payout
            require(
                cUSDToken.transfer(policy.farmer, payoutAmount),
                "Payout transfer failed"
            );
            
            emit CropPayoutProcessed(
                _policyId,
                _cropIndex,
                crop.cropType,
                policy.farmer,
                payoutAmount
            );
        }
    }
    
    function processAllCropPayouts(uint256 _policyId) external nonReentrant {
        validMultiCropPolicy(_policyId)();
        
        MultiCropPolicyData storage policy = multiCropPolicies[_policyId];
        require(policy.isPaid, "Premium not paid");
        
        // Process each crop
        for (uint256 i = 0; i < policy.crops.length; i++) {
            if (!cropPayoutStatus[_policyId][i]) {
                this.processCropPayout(_policyId, i);
            }
        }
    }
    
    function deactivateMultiCropPolicy(uint256 _policyId) external onlyOwner {
        validMultiCropPolicy(_policyId)();
        
        MultiCropPolicyData storage policy = multiCropPolicies[_policyId];
        policy.isActive = false;
        
        emit MultiCropPolicyDeactivated(_policyId, policy.farmer);
    }
    
    function getMultiCropPolicy(uint256 _policyId) external view returns (MultiCropPolicyData memory) {
        require(
            _policyId > 0 && _policyId <= multiCropPolicyCounter,
            "Invalid policy ID"
        );
        return multiCropPolicies[_policyId];
    }
    
    function getFarmerMultiCropPolicies(address _farmer) external view returns (uint256[] memory) {
        return farmerMultiCropPolicies[_farmer];
    }
    
    function getCropPayoutStatus(uint256 _policyId, uint256 _cropIndex) external view returns (bool) {
        return cropPayoutStatus[_policyId][_cropIndex];
    }
    
    function getAllCropPayoutStatus(uint256 _policyId) external view returns (bool[] memory) {
        MultiCropPolicyData storage policy = multiCropPolicies[_policyId];
        bool[] memory status = new bool[](policy.crops.length);
        
        for (uint256 i = 0; i < policy.crops.length; i++) {
            status[i] = cropPayoutStatus[_policyId][i];
        }
        
        return status;
    }
    
    function getMultiCropPolicySummary(uint256 _policyId) external view returns (
        uint256 totalCoverage,
        uint256 totalPremium,
        uint256 cropCount,
        uint256 paidCrops,
        bool isActive,
        bool isPaid
    ) {
        MultiCropPolicyData storage policy = multiCropPolicies[_policyId];
        
        uint256 paidCount = 0;
        for (uint256 i = 0; i < policy.crops.length; i++) {
            if (cropPayoutStatus[_policyId][i]) {
                paidCount++;
            }
        }
        
        return (
            policy.totalCoverage,
            policy.totalPremium,
            policy.crops.length,
            paidCount,
            policy.isActive,
            policy.isPaid
        );
    }
    
    function calculateBundlePremium(
        CropEntry[] memory _crops,
        string memory _location,
        uint256 _measurementPeriod
    ) external view returns (uint256) {
        require(_crops.length > 0, "Must include at least one crop");
        
        uint256 totalPremium = 0;
        
        for (uint256 i = 0; i < _crops.length; i++) {
            DynamicPremiums.PremiumCalculation memory calc = dynamicPremiums.calculateDynamicPremium(
                _crops[i].coverageAmount,
                _location,
                _crops[i].cropType,
                _measurementPeriod,
                _crops[i].rainfallThreshold
            );
            
            totalPremium += calc.finalPremium;
        }
        
        // Apply bundle discount
        uint256 discountAmount = (totalPremium * bundleDiscount) / 10000;
        return totalPremium - discountAmount;
    }
    
    function getActiveMultiCropPolicies() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active policies
        for (uint256 i = 1; i <= multiCropPolicyCounter; i++) {
            if (multiCropPolicies[i].isActive) {
                activeCount++;
            }
        }
        
        uint256[] memory activePolicyIds = new uint256[](activeCount);
        uint256 index = 0;
        
        // Populate active policies
        for (uint256 i = 1; i <= multiCropPolicyCounter; i++) {
            if (multiCropPolicies[i].isActive) {
                activePolicyIds[index] = i;
                index++;
            }
        }
        
        return activePolicyIds;
    }
    
    function getMultiCropPoliciesByLocation(string memory _location) external view returns (uint256[] memory) {
        uint256 locationCount = 0;
        
        // Count policies at location
        for (uint256 i = 1; i <= multiCropPolicyCounter; i++) {
            if (keccak256(bytes(multiCropPolicies[i].location)) == keccak256(bytes(_location))) {
                locationCount++;
            }
        }
        
        uint256[] memory locationPolicyIds = new uint256[](locationCount);
        uint256 index = 0;
        
        // Populate location policies
        for (uint256 i = 1; i <= multiCropPolicyCounter; i++) {
            if (keccak256(bytes(multiCropPolicies[i].location)) == keccak256(bytes(_location))) {
                locationPolicyIds[index] = i;
                index++;
            }
        }
        
        return locationPolicyIds;
    }
    
    function getMultiCropPoliciesByCrop(string memory _cropType) external view returns (uint256[] memory) {
        uint256 cropCount = 0;
        
        // Count policies with specific crop
        for (uint256 i = 1; i <= multiCropPolicyCounter; i++) {
            MultiCropPolicyData storage policy = multiCropPolicies[i];
            for (uint256 j = 0; j < policy.crops.length; j++) {
                if (keccak256(bytes(policy.crops[j].cropType)) == keccak256(bytes(_cropType))) {
                    cropCount++;
                    break;
                }
            }
        }
        
        uint256[] memory cropPolicyIds = new uint256[](cropCount);
        uint256 index = 0;
        
        // Populate crop policies
        for (uint256 i = 1; i <= multiCropPolicyCounter; i++) {
            MultiCropPolicyData storage policy = multiCropPolicies[i];
            for (uint256 j = 0; j < policy.crops.length; j++) {
                if (keccak256(bytes(policy.crops[j].cropType)) == keccak256(bytes(_cropType))) {
                    cropPolicyIds[index] = i;
                    index++;
                    break;
                }
            }
        }
        
        return cropPolicyIds;
    }
    
    function setBundleDiscount(uint256 _newDiscount) external onlyOwner {
        require(_newDiscount <= 2000, "Discount too high"); // Max 20%
        
        uint256 oldDiscount = bundleDiscount;
        bundleDiscount = _newDiscount;
        
        emit BundleDiscountUpdated(oldDiscount, _newDiscount);
    }
    
    function setMaxCropsPerPolicy(uint256 _newMax) external onlyOwner {
        require(_newMax > 0 && _newMax <= 50, "Invalid max crops");
        
        uint256 oldMax = maxCropsPerPolicy;
        maxCropsPerPolicy = _newMax;
        
        emit MaxCropsUpdated(oldMax, _newMax);
    }
    
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = cUSDToken.balanceOf(address(this));
        if (balance > 0) {
            require(cUSDToken.transfer(owner(), balance), "Emergency withdrawal failed");
        }
    }
    
    function getContractBalance() external view returns (uint256) {
        return cUSDToken.balanceOf(address(this));
    }
    
    function getMultiCropPolicyStats() external view returns (
        uint256 totalPolicies,
        uint256 activePolicies,
        uint256 paidPolicies,
        uint256 totalCoverage,
        uint256 totalPremiums
    ) {
        uint256 active = 0;
        uint256 paid = 0;
        uint256 coverage = 0;
        uint256 premiums = 0;
        
        for (uint256 i = 1; i <= multiCropPolicyCounter; i++) {
            MultiCropPolicyData storage policy = multiCropPolicies[i];
            
            if (policy.isActive) {
                active++;
            }
            
            if (policy.isPaid) {
                paid++;
            }
            
            coverage += policy.totalCoverage;
            premiums += policy.totalPremium;
        }
        
        return (
            multiCropPolicyCounter,
            active,
            paid,
            coverage,
            premiums
        );
    }
}
