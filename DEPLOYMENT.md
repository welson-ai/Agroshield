# Deployment Guide

## 🚀 Quick Deploy

### 📋 Prerequisites
- **Node.js**: v18+
- **Private Key**: In `.env` file
- **CELO Balance**: ~1 CELO for gas
- **cUSD Balance**: ~1 cUSD for testing

### 🌐 Networks

#### Celo Mainnet
```bash
# Deploy AgroShieldPool
npm run deploy-simple

# Transaction spinning
npm run spin-full
```

#### Celo Alfajores (Testnet)
```bash
# Deploy to testnet
npx hardhat run scripts/deploy-pool.js --network celo-alfajores

# Test transactions
npx hardhat run scripts/spin-transactions.js --network celo-alfajores
```

## 📊 Contract Addresses

### 🌐 Mainnet
- **AgroShieldPool**: `0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6`
- **cUSD Token**: `0x765DE816845861e75A25fCA122bb6898B8B1282a`
- **CeloScan**: [Contract Explorer](https://celoscan.io/address/0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6)

### 🧪 Testnet
- **cUSD Token**: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`
- **RPC**: `https://alfajores-forno.celo.org`

## 🔧 Environment Setup

### 📝 .env Configuration
```bash
# Required environment variables
PRIVATE_KEY=0xYourPrivateKeyHere
CELO_RPC_URL=https://forno.celo.org

# Optional
CELOSCAN_API_KEY=your_api_key_here
```

### 🛠️ Installation
```bash
# Clone repository
git clone https://github.com/welson-ai/Agroshield.git

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your private key
```

## 🚀 Deployment Steps

### 1. Local Testing
```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Local deployment
npx hardhat run scripts/deploy-pool.js --network localhost
```

### 2. Testnet Deployment
```bash
# Deploy to Alfajores
npx hardhat run scripts/deploy-pool.js --network celo-alfajores

# Verify deployment
npx hardhat verify --network celo-alfajores <contract-address>
```

### 3. Mainnet Deployment
```bash
# Deploy to mainnet
npm run deploy-simple

# Save deployment info
# Check deployment-pool-simple.json
```

## 📊 Transaction Spinning

### 🎯 Purpose
- **Load Testing**: Verify contract under stress
- **Gas Analysis**: Monitor consumption patterns
- **Integration**: Test with real tokens
- **Validation**: Ensure on-chain functionality

### 🚀 Commands
```bash
# Single transaction test
npm run spin-standard

# Full 50-iteration spinning
npm run spin-full

# Custom iterations
node scripts/spin-full-working.cjs
```

### 📈 Expected Results
- **Transactions**: 150 total (50 spins × 3)
- **Gas Usage**: ~8M gas total
- **cUSD Volume**: 0.5 cUSD processed
- **Success Rate**: ~75-80%

## 🔍 Verification

### 📋 Post-Deployment Checklist
- [ ] Contract verified on CeloScan
- [ ] Functions accessible via web3
- [ ] Gas estimates reasonable
- [ ] Test transactions successful
- [ ] Error handling working

### 🔗 Useful Links
- **CeloScan**: https://celoscan.io/
- **Celo Documentation**: https://docs.celo.org/
- **Hardhat Docs**: https://hardhat.org/docs

## 🚨 Troubleshooting

### Common Issues
1. **Gas Limit Too Low**
   ```bash
   # Increase gas limit in deployment script
   gasLimit: 3000000
   ```

2. **Private Key Format**
   ```bash
   # Ensure 0x prefix
   PRIVATE_KEY=0xYourKeyHere
   ```

3. **Network Configuration**
   ```bash
   # Verify RPC URL
   CELO_RPC_URL=https://forno.celo.org
   ```

### 📞 Support
- **Issues**: [GitHub Issues](https://github.com/welson-ai/Agroshield/issues)
- **Discord**: [Community Support](https://discord.gg/agroshield)
- **Documentation**: [Contract Docs](./contracts/README.md)

---

**Ready for deployment! 🚀**
