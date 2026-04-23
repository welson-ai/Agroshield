# Deployment Guide

*Last updated: April 23, 2026*

## Overview

This guide covers deploying AgroShield smart contracts to various networks.

## Prerequisites

- Node.js 18+
- Hardhat installed
- Wallet with sufficient funds
- Environment variables configured

## Environment Setup

Create a `.env` file:

```bash
# Private key for deployment
PRIVATE_KEY=your_private_key_here

# RPC URLs
CELO_MAINNET_RPC=https://forno.celo.org
CELO_ALFAJORES_RPC=https://alfajores-forno.celo-testnet.org

# Network configurations
CELO_MAINNET_CHAIN_ID=42220
CELO_ALFAJORES_CHAIN_ID=44787
```

## Deployment Steps

### 1. Compile Contracts

```bash
npx hardhat compile
```

### 2. Run Tests

```bash
npx hardhat test
```

### 3. Deploy to Testnet

```bash
npx hardhat run scripts/deploy.js --network alfajores
```

### 4. Verify Contracts

```bash
npx hardhat verify --network alfajores <CONTRACT_ADDRESS>
```

### 5. Deploy to Mainnet

```bash
npx hardhat run scripts/deploy.js --network celo
```

## Network Configurations

### Celo Mainnet
- Chain ID: 42220
- RPC: https://forno.celo.org
- Explorer: https://celoscan.io
- Gas Token: CELO

### Celo Alfajores Testnet
- Chain ID: 44787
- RPC: https://alfajores-forno.celo-testnet.org
- Explorer: https://alfajores.celoscan.io
- Faucet: https://celo.org/developers/faucet

## Contract Addresses

After deployment, update the addresses in:

```javascript
// frontend/src/config/contracts.js
export const CONTRACTS = {
  MAINNET: {
    AGROSHIELD_POOL: "0x...",
    AGROSHIELD_POLICY: "0x...",
    AGROSHIELD_ORACLE: "0x...",
  },
  ALFAJORES: {
    AGROSHIELD_POOL: "0x...",
    AGROSHIELD_POLICY: "0x...",
    AGROSHIELD_ORACLE: "0x...",
  }
};
```

## Post-Deployment Checklist

- [ ] Verify all contracts on explorer
- [ ] Update frontend configuration
- [ ] Test contract interactions
- [ ] Set up monitoring
- [ ] Document addresses

## Troubleshooting

### Gas Issues
- Check gas prices: https://celoscan.io/gastracker
- Increase gas limit if needed
- Use gas estimation tools

### Transaction Failures
- Check wallet balance
- Verify network configuration
- Review contract constructor parameters

### Verification Issues
- Ensure exact constructor parameters
- Check compiler version matches
- Verify network is correct

## Security Considerations

- Use hardware wallets for mainnet deployment
- Test thoroughly on testnet first
- Use multi-sig for production contracts
- Keep private keys secure

## Monitoring

Set up monitoring for:
- Contract events
- Gas usage
- Error rates
- User activity

## Support

For deployment issues:
- Check the documentation
- Review test cases
- Contact the team
- Create GitHub issue
