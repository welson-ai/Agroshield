// Contract addresses on Celo mainnet
export const AGROSHIELD_CONTRACTS = {
  CELO: {
    CUSD_TOKEN: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
    POOL: "0x369b50a492e9de0e4989910bd3594aebd89b5d21",
    ORACLE: "0xaa4c5e3c0fe03da8d1a3145ccdf0ef5f8661442b",
    POLICY: "0xd857973f3f5313d0721d539fcbab1395bfc87d78",
  },
} as const

// Minimal ABIs for essential functions
export const AGROSHIELD_ABIS = {
  POOL: [
    "function provideLiquidity(uint256)",
    "function withdrawLiquidity(uint256)",
    "function getTotalLiquidity() view returns (uint256)",
    "function getUserShares(address) view returns (uint256)",
    "function getAvailableLiquidity() view returns (uint256)",
    "function getReserveRatio() view returns (uint256)"
  ],
  POLICY: [
    "function createPolicy(string,uint256,uint256,uint256,uint256,uint256)",
    "function payPremium(uint256)",
    "function getActivePoliciesCount() view returns (uint256)",
    "function getUserPolicies(address) view returns (tuple[])",
    "function getPolicy(uint256) view returns (tuple)"
  ],
  ORACLE: [
    "function submitWeatherData(uint256,uint256,uint256,uint256)",
    "function getLatestWeatherData() view returns (tuple)",
    "function setPolicyContract(address)",
    "function authorizeProvider(address)",
    "function manualPayoutTrigger(uint256)"
  ]
} as const

export type Network = keyof typeof AGROSHIELD_CONTRACTS
export type ContractName = keyof typeof AGROSHIELD_ABIS
