# AgroShield Smart Contracts

## 📋 Contract Overview

This directory contains all smart contracts for the AgroShield parametric crop insurance platform.

## 🚀 Working Contracts (OpenZeppelin v5 Compatible)

### ✅ Production Ready
- **AgroShieldPool-Simple.sol**: Main liquidity pool contract
  - Address: `0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6`
  - Functions: `provideLiquidity`, `withdrawLiquidity`, `totalLiquidity`
  - Status: ✅ Deployed and working

- **AgroShieldPool.sol**: Full-featured liquidity pool
  - Status: ✅ Fixed and ready

### 🔧 Fixed Contracts
- **AgroShieldOracle.sol**: Weather data oracle
  - Fixed: Added constructor with `Ownable(msg.sender)`
  - Status: ✅ OpenZeppelin v5 compatible

- **AgroShieldPolicy.sol**: Policy management
  - Fixed: Added constructor with proper parameters
  - Status: ✅ OpenZeppelin v5 compatible

- **InsurancePoolStaking.sol**: Staking functionality
  - Fixed: Arithmetic operations, constructor
  - Status: ✅ OpenZeppelin v5 compatible

### 🆕 New Fixed Versions
- **MockERC20-Fixed.sol**: Test token contract
- **MultiCropPolicy-Fixed.sol**: Multi-crop policy support
- **PolicyMarketplace-Fixed.sol**: Policy marketplace
- **WeatherPrediction-Fixed.sol**: Weather predictions
- **DynamicPremiums-Fixed.sol**: Dynamic premium calculations

## 📊 Contract Addresses

### 🌐 Celo Mainnet
- **AgroShieldPool**: `0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6`
- **cUSD Token**: `0x765DE816845861e75A25fCA122bb6898B8B1282a`

## 🔧 Development Status

### ✅ Completed
- OpenZeppelin v5 compatibility fixes
- Constructor parameter updates
- Arithmetic operation fixes
- Type conversion corrections
- Variable declaration fixes

### 🚀 Ready For
- Deployment to production
- Integration with talent protocol
- Transaction spinning
- High-volume testing

## 📝 Notes

- All contracts use Solidity `^0.8.19` or `^0.8.20`
- OpenZeppelin v5 compatibility implemented
- Gas optimization applied where possible
- Security patterns: ReentrancyGuard, Ownable

## 🔗 Links

- [CeloScan Contract](https://celoscan.io/address/0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6)
- [Transaction Spinning Scripts](../scripts/)
- [Deployment Info](../deployment-pool-simple.json)
