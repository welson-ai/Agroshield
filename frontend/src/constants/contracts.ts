// Contract addresses on Celo mainnet
export const AGROSHIELD_CONTRACTS = {
  CELO: {
    CUSD_TOKEN: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
    POOL: "0x369b50a492e9de0e4989910bd3594aebd89b5d21",
    ORACLE: "0xaa4c5e3c0fe03da8d1a3145ccdf0ef5f8661442b",
    POLICY: "0xd857973f3f5313d0721d539fcbab1395bfc87d78",
    MARKETPLACE: "0x1234567890123456789012345678901234567890", // Placeholder
    DYNAMIC_PREMIUMS: "0x1234567890123456789012345678901234567890", // Placeholder
    MULTI_CROP_POLICY: "0x1234567890123456789012345678901234567890", // Placeholder
    WEATHER_PREDICTION: "0x1234567890123456789012345678901234567890", // Placeholder
    INSURANCE_POOL_STAKING: "0x1234567890123456789012345678901234567890", // Placeholder
  },
  CELO_SEPOLIA: {
    CUSD_TOKEN: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
    POOL: "0x369b50a492e9de0e4989910bd3594aebd89b5d21",
    ORACLE: "0xaa4c5e3c0fe03da8d1a3145ccdf0ef5f8661442b",
    POLICY: "0xd857973f3f5313d0721d539fcbab1395bfc87d78",
    MARKETPLACE: "0x1234567890123456789012345678901234567890", // Placeholder
    DYNAMIC_PREMIUMS: "0x1234567890123456789012345678901234567890", // Placeholder
    MULTI_CROP_POLICY: "0x1234567890123456789012345678901234567890", // Placeholder
    WEATHER_PREDICTION: "0x1234567890123456789012345678901234567890", // Placeholder
    INSURANCE_POOL_STAKING: "0x1234567890123456789012345678901234567890", // Placeholder
  },
} as const

// Comprehensive ABIs for all contracts
export const AGROSHIELD_ABIS = {
  POOL: [
    "function provideLiquidity(uint256)",
    "function withdrawLiquidity(uint256)",
    "function getTotalLiquidity() view returns (uint256)",
    "function getUserShares(address) view returns (uint256)",
    "function getAvailableLiquidity() view returns (uint256)",
    "function getReserveRatio() view returns (uint256)",
    "function authorizePolicy(address)",
    "function withdrawReserve(uint256)",
    "function setReserveRatio(uint256)",
    "event LiquidityProvided(address indexed provider, uint256 amount)",
    "event LiquidityWithdrawn(address indexed provider, uint256 amount)",
    "event ReserveRatioUpdated(uint256 oldRatio, uint256 newRatio)"
  ],
  POLICY: [
    "function createPolicy(string,uint256,uint256,uint256,uint256,uint256)",
    "function payPremium(uint256)",
    "function getActivePoliciesCount() view returns (uint256)",
    "function getUserPolicies(address) view returns (tuple[])",
    "function getPolicy(uint256) view returns (tuple)",
    "function transferPolicy(uint256,address)",
    "function deactivatePolicy(uint256)",
    "function setPoolContract(address)",
    "function setOracleContract(address)",
    "event PolicyCreated(uint256 indexed policyId, address indexed farmer, uint256 coverage, uint256 premium)",
    "event PremiumPaid(uint256 indexed policyId, address indexed farmer, uint256 amount)",
    "event PolicyTransferred(uint256 indexed policyId, address indexed from, address indexed to)"
  ],
  ORACLE: [
    "function submitWeatherData(uint256,uint256,uint256,uint256)",
    "function getLatestWeatherData() view returns (tuple)",
    "function setPolicyContract(address)",
    "function authorizeProvider(address)",
    "function manualPayoutTrigger(uint256)",
    "function getWeatherData(string) view returns (tuple)",
    "function triggerPolicyPayout(uint256)",
    "event WeatherDataSubmitted(string location, uint256 rainfall, uint256 temperature)",
    "event PayoutTriggered(uint256 indexed policyId, address indexed farmer, uint256 amount)"
  ],
  MARKETPLACE: [
    "function listPolicy(uint256,uint256,uint256)",
    "function delistPolicy(uint256)",
    "function makeOffer(uint256,uint256)",
    "function acceptOffer(uint256,uint256)",
    "function buyPolicy(uint256)",
    "function withdrawOffer(uint256,uint256)",
    "function getListing(uint256) view returns (tuple)",
    "function getActiveListings() view returns (uint256[])",
    "function getListingsBySeller(address) view returns (uint256[])",
    "function getOffersByListing(uint256) view returns (tuple[])",
    "event PolicyListed(uint256 indexed listingId, uint256 indexed policyId, address indexed seller, uint256 price)",
    "event OfferMade(uint256 indexed listingId, uint256 indexed offerId, address indexed buyer, uint256 amount)",
    "event PolicyTransferred(uint256 indexed policyId, address indexed from, address indexed to, uint256 price)"
  ],
  DYNAMIC_PREMIUMS: [
    "function calculateDynamicPremium(uint256,string,string,uint256,uint256) view returns (tuple)",
    "function updateLocationRiskFactor(string,uint256,uint256,uint256,uint256)",
    "function updateCropRiskProfile(string,uint256,uint256,uint256)",
    "function getLocationRiskFactor(string) view returns (tuple)",
    "function getCropRiskProfile(string) view returns (tuple)",
    "function getActiveLocations() view returns (string[])",
    "function getActiveCrops() view returns (string[])",
    "event LocationRiskFactorUpdated(string location, uint256 riskScore)",
    "event CropRiskProfileUpdated(string cropType, uint256 riskMultiplier)"
  ],
  MULTI_CROP_POLICY: [
    "function createMultiCropPolicy(tuple[],string,uint256,string) returns (uint256)",
    "function payMultiCropPremium(uint256)",
    "function processCropPayout(uint256,uint256)",
    "function processAllCropPayouts(uint256)",
    "function getMultiCropPolicy(uint256) view returns (tuple)",
    "function getFarmerMultiCropPolicies(address) view returns (uint256[])",
    "function calculateBundlePremium(tuple[],string,uint256) view returns (uint256)",
    "event MultiCropPolicyCreated(uint256 indexed policyId, address indexed farmer, uint256 totalCoverage)",
    "event CropPayoutProcessed(uint256 indexed policyId, uint256 indexed cropIndex, string cropType, uint256 payoutAmount)"
  ],
  WEATHER_PREDICTION: [
    "function submitWeatherPrediction(string,uint256,uint256,uint256,uint256,string)",
    "function validatePrediction(string,uint256,uint256)",
    "function calculatePremiumWithPrediction(uint256,string,string,uint256,uint256) view returns (tuple)",
    "function getLocationPredictions(string) view returns (tuple[])",
    "function getActivePredictions(string) view returns (tuple[])",
    "function getPredictionAccuracy(string) view returns (tuple)",
    "event WeatherPredicted(string location, uint256 predictedRainfall, uint256 confidence)",
    "event PredictionValidated(string location, uint256 predictedRainfall, uint256 actualRainfall, bool wasAccurate)"
  ],
  INSURANCE_POOL_STAKING: [
    "function createStakePosition(uint256,uint256) returns (uint256)",
    "function extendStakePosition(uint256)",
    "function claimRewards(uint256)",
    "function withdrawStake(uint256)",
    "function getStakePositions(address) view returns (tuple[])",
    "function getStakerStats(address) view returns (uint256,uint256,uint256,uint256)",
    "function getPoolStats() view returns (uint256,uint256,uint256,uint256,uint256)",
    "event StakePositionCreated(uint256 indexed positionId, address indexed staker, uint256 amount, uint256 tier)",
    "event RewardsClaimed(uint256 indexed positionId, address indexed staker, uint256 rewardAmount)",
    "event StakePositionWithdrawn(uint256 indexed positionId, address indexed staker, uint256 amount, uint256 rewards)"
  ]
} as const

export type Network = keyof typeof AGROSHIELD_CONTRACTS
export type ContractName = keyof typeof AGROSHIELD_ABIS
