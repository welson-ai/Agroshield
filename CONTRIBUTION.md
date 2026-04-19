# Contributing to AgroShield

## 🚀 Quick Start

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow our commit patterns
4. **Test thoroughly**: Ensure all contracts compile
5. **Submit PR**: With clear description

## 📋 Development Requirements

### 🛠️ Smart Contracts
- **Solidity**: `^0.8.19` or `^0.8.20`
- **OpenZeppelin**: v5 compatibility required
- **Gas Optimization**: Minimize storage operations
- **Security**: Use ReentrancyGuard, Ownable patterns

### 🔧 Testing
- **Hardhat**: For local development
- **Celo Testnet**: For integration testing
- **Transaction Spinning**: Verify on-chain functionality

## 📝 Commit Guidelines

### ✅ Good Commits
- **Descriptive**: Clear what and why
- **Granular**: One logical change per commit
- **Referenced**: Link to issues when possible
- **Example**: `Fix #65: Add constructor to AgroShieldOracle`

### 📫 Bad Commits
- **Vague**: "Fixed stuff", "Updated code"
- **Large**: Multiple unrelated changes
- **Unreferenced**: No issue tracking
- **Broken**: Don't break compilation

## 🎯 Project Structure

```
contracts/          # Smart contracts
├── AgroShieldPool.sol
├── AgroShieldOracle.sol
├── AgroShieldPolicy.sol
└── Fixed versions...

scripts/             # Deployment and utility scripts
├── deploy-*.js     # Contract deployment
├── spin-*.cjs      # Transaction spinning
└── check-*.cjs      # Contract diagnostics

frontend/            # React frontend
test/               # Test suites
```

## 🔍 Code Review Process

1. **Automated Checks**: Compilation, linting
2. **Manual Review**: Logic, security, gas
3. **Testing**: Local + testnet verification
4. **Integration**: Ensure compatibility

## 🚀 Deployment Process

1. **Local Testing**: `npx hardhat test`
2. **Testnet Deploy**: Verify functionality
3. **Mainnet Deploy**: With proper gas settings
4. **Verification**: On CeloScan
5. **Documentation**: Update addresses

## 📊 Transaction Spinning

### 🎯 Purpose
- **Load Testing**: Verify contract under stress
- **Gas Analysis**: Monitor consumption
- **Integration**: Test with real tokens
- **Validation**: Ensure on-chain functionality

### 🚀 Commands
```bash
# Single transaction test
npm run spin-standard

# Full 50-iteration spinning
npm run spin-full

# Deploy new contracts
npm run deploy-simple
```

## 🔧 Environment Setup

### 📋 Required
- **Node.js**: v18+
- **Hardhat**: v3.0+
- **Private Key**: In `.env` file
- **Celo RPC**: For mainnet/testnet

### ⚙️ Configuration
```bash
# .env file
PRIVATE_KEY=0x...
CELO_RPC_URL=https://forno.celo.org
```

## 🎊 Getting Help

- **Issues**: Create detailed bug reports
- **Discussions**: Ask questions
- **Discord**: Real-time chat
- **Documentation**: Check contracts/README.md

## 📜 License

MIT License - see LICENSE file for details.

---

**Happy Contributing! 🚀**
