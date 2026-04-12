export const AGROSHIELD_CONTRACTS = {
  CELO: {
    CUSD_TOKEN: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
    POOL: "0xef65b6fe2e9de3fa865aa87107db4bcd458115d5",
    ORACLE: "0xaa4c5e3c0fe03da8d1a3145ccdf0ef5f8661442b",
    POLICY: "0xd857973f3f5313d0721d539fcbab1395bfc87d78",
  },
} as const

export type Network = keyof typeof AGROSHIELD_CONTRACTS
