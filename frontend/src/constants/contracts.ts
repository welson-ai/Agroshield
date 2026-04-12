import AgroShieldPoolArtifact from '../../../artifacts/contracts/AgroShieldPool.sol/AgroShieldPool.json'
import AgroShieldPolicyArtifact from '../../../artifacts/contracts/AgroShieldPolicy.sol/AgroShieldPolicy.json'
import AgroShieldOracleArtifact from '../../../artifacts/contracts/AgroShieldOracle.sol/AgroShieldOracle.json'

export const AGROSHIELD_CONTRACTS = {
  CELO: {
    CUSD_TOKEN: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
    POOL: "0x369b50a492e9de0e4989910bd3594aebd89b5d21",
    ORACLE: "0xaa4c5e3c0fe03da8d1a3145ccdf0ef5f8661442b",
    POLICY: "0xd857973f3f5313d0721d539fcbab1395bfc87d78",
  },
} as const

export const AGROSHIELD_ABIS = {
  POOL: AgroShieldPoolArtifact.abi,
  POLICY: AgroShieldPolicyArtifact.abi,
  ORACLE: AgroShieldOracleArtifact.abi,
} as const

export type Network = keyof typeof AGROSHIELD_CONTRACTS
export type ContractName = keyof typeof AGROSHIELD_ABIS
