# Testing Guide

## 🧪 Testing Strategy

AgroShield uses a comprehensive testing approach to ensure contract reliability and security.

## 📋 Test Categories

### 🔒 Security Tests
- **Reentrancy**: Verify protection mechanisms
- **Access Control**: Test ownership and permissions
- **Input Validation**: Check parameter boundaries
- **Integer Overflow**: Validate arithmetic operations

### 💰 Financial Tests
- **Token Transfers**: ERC20 standard compliance
- **Balance Tracking**: Verify accounting accuracy
- **Gas Consumption**: Optimize transaction costs
- **Fee Calculations**: Validate premium logic

### 🔄 Functional Tests
- **Policy Creation**: End-to-end workflow
- **Liquidity Management**: Deposit/withdrawal cycles
- **Oracle Integration**: Weather data processing
- **Marketplace Operations**: Buy/sell transactions

## 🚀 Test Environments

### 🌐 Local Development
```bash
# Start local Hardhat network
npx hardhat node

# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/contracts/AgroShieldPool.test.ts
```

### 🧪 Celo Alfajores (Testnet)
```bash
# Deploy to testnet
npx hardhat run scripts/deploy-pool.js --network celo-alfajores

# Test with testnet cUSD
node scripts/spin-standalone.cjs

# Verify contract functionality
npx hardhat run scripts/check-contract.cjs --network celo-alfajores
```

### 🌐 Celo Mainnet (Production)
```bash
# Deploy to mainnet
npm run deploy-simple

# Transaction spinning tests
npm run spin-full

# Monitor on-chain activity
# Check CeloScan for transactions
```

## 📊 Test Scenarios

### 🎯 Transaction Spinning
```javascript
// High-volume testing
const SPIN_COUNT = 50;
const SPIN_AMOUNT = parseEther("0.01");

// Expected results
// - 150 total transactions
// - 0.5 cUSD volume
// - ~8M gas usage
// - 75% success rate
```

### 💸 Stress Testing
```javascript
// Concurrent transactions
const CONCURRENT_USERS = 10;
const TRANSACTIONS_PER_USER = 20;

// Monitor for:
// - Reentrancy attempts
// - Gas limit issues
// - State consistency
// - Error handling
```

### 🔍 Edge Cases
```javascript
// Boundary conditions
await contract.provideLiquidity(0); // Should fail
await contract.provideLiquidity(1); // Minimum amount
await contract.withdrawLiquidity(maxUint256); // Overflow test

// Invalid inputs
await contract.withdrawLiquidity(999999999999); // Excessive amount
```

## 📈 Performance Metrics

### ⛽ Gas Analysis
- **Deposit**: ~55,000 gas
- **Withdrawal**: ~55,000 gas
- **Approval**: ~17,000 gas
- **Total per spin**: ~127,000 gas

### 📊 Success Rates
- **Target**: >90% success rate
- **Current**: ~78% (optimizing)
- **Goal**: >95% with improvements

### 🕒 Timing Analysis
- **Block Time**: ~5 seconds on Celo
- **Confirmation**: ~2-3 blocks
- **Indexing**: ~30-60 seconds on CeloScan

## 🧪 Test Scripts

### 🚀 Automated Testing
```bash
# Run full test suite
npm test

# Contract compilation test
npm run compile

# Gas usage analysis
npx hardhat test --grep "gas"
```

### 🔍 Manual Testing
```bash
# Single transaction test
npm run spin-standard

# Contract diagnostics
npm run debug-contract

# Balance verification
node scripts/check-token.cjs
```

## 📋 Test Data

### 🌡️ Test Accounts
```javascript
const TEST_ACCOUNTS = [
  "0xAccount1...", // Deployer
  "0xAccount2...", // User 1
  "0xAccount3...", // User 2
];
```

### 💰 Test Amounts
```javascript
const TEST_AMOUNTS = [
  parseEther("0.01"),  // Minimum
  parseEther("0.1"),   // Standard
  parseEther("1.0"),   // Large
  parseEther("10.0")   // Maximum
];
```

## 🚨 Test Results

### ✅ Current Status
- **Compilation**: All contracts compile successfully
- **Deployment**: Mainnet contract deployed and verified
- **Transactions**: 131 confirmed on-chain
- **Functionality**: Core features working correctly

### 📊 Performance Data
- **Volume Processed**: 0.78 cUSD
- **Gas Consumed**: 8,652,877 gas
- **Success Rate**: 78% (39/50 spins)
- **Error Rate**: 22% (11 failed spins)

### 🔍 Common Issues
- **Nonce Conflicts**: 6 failures due to timing
- **Allowance Issues**: 3 failures from token limits
- **Share Calculation**: 2 failures from zero shares

## 🎯 Test Coverage

### 📋 Coverage Areas
- [x] Contract deployment
- [x] Basic transactions
- [x] Error handling
- [x] Gas optimization
- [ ] Reentrancy attacks
- [ ] Access control bypass
- [ ] Oracle manipulation
- [ ] Multi-contract interactions

### 🧪 Integration Tests
- [x] Single contract operations
- [x] High-volume transactions
- [x] Network connectivity
- [ ] Cross-contract calls
- [ ] Complex user workflows
- [ ] Emergency scenarios

## 📞 Test Support

### 🐛 Bug Reporting
- **Format**: Use issue templates
- **Logs**: Include transaction hashes
- **Environment**: Specify network and contract version
- **Reproduction**: Clear steps to reproduce

### 📊 Test Data Collection
- **Metrics**: Gas, timing, success rates
- **Monitoring**: Real-time transaction tracking
- **Analysis**: Performance bottleneck identification
- **Reporting**: Regular test summary updates

---

**Comprehensive testing ensures production readiness! 🧪**
