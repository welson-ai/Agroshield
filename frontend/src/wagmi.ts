import { http, createConfig } from 'wagmi'
import { celo } from 'wagmi/chains'
import { walletConnect, injected, metaMask } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const config = createConfig({
  chains: [celo],
  connectors: [
    walletConnect({ projectId }),
    injected(),
    metaMask(),
  ],
  transports: {
    [celo.id]: http('https://celo-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
