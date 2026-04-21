# AgroShield Troubleshooting Guide

## Common Issues

### Installation Issues

#### Node.js Version Error
```
Error: Node.js version not supported
```

**Solution:**
```bash
# Check current version
node --version

# Install required version (18+)
nvm install 18
nvm use 18
```

#### Dependency Conflicts
```
Error: Cannot resolve dependency tree
```

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Smart Contract Issues

#### Compilation Errors
```
Error: Compiler version mismatch
```

**Solution:**
```bash
# Check Solidity version
npx hardhat compile --verbose

# Update pragma in contracts
pragma solidity ^0.8.19;
```

#### Gas Estimation Failed
```
Error: Gas estimation failed
```

**Solution:**
- Check contract balance
- Verify gas price settings
- Increase gas limit manually
- Check for revert conditions

#### Transaction Reverted
```
Error: Transaction reverted
```

**Solution:**
- Check function parameters
- Verify contract state
- Review error messages
- Use testnet for debugging

### Frontend Issues

#### Wallet Connection Failed
```
Error: Wallet connection failed
```

**Solution:**
- Check wallet is unlocked
- Verify network (Celo Mainnet: 42220)
- Clear browser cache
- Try different browser

#### MetaMask Not Detected
```
Error: MetaMask not detected
```

**Solution:**
- Install MetaMask extension
- Refresh page after installation
- Check browser compatibility
- Try incognito mode

#### Transaction Pending
```
Transaction stuck in pending
```

**Solution:**
- Check gas price
- Replace transaction with higher gas
- Wait for network congestion to clear
- Use RPC with higher priority

### Test Issues

#### Test Timeout
```
Error: Test timeout exceeded
```

**Solution:**
```bash
# Increase timeout in hardhat.config.js
module.exports = {
  mocha: {
    timeout: 60000 // 60 seconds
  }
};
```

#### Test Network Issues
```
Error: Network connection failed
```

**Solution:**
- Check RPC endpoint
- Verify network configuration
- Restart local hardhat node
- Check internet connection

### Performance Issues

#### Slow Loading
```
Frontend loading slowly
```

**Solution:**
- Check network latency
- Optimize images
- Enable caching
- Use CDN for assets

#### High Gas Costs
```
Gas costs too high
```

**Solution:**
- Check gas prices: https://celoscan.io/gastracker
- Use gas optimization techniques
- Batch transactions when possible
- Wait for lower gas periods

## Debugging Tools

### Smart Contract Debugging
```bash
# Hardhat console
npx hardhat console

# Local network
npx hardhat node

# Test with specific network
npx hardhat test --network localhost
```

### Frontend Debugging
```javascript
// Enable debug mode
localStorage.setItem('debug', 'true');

// Check wallet connection
console.log(window.ethereum);

// Monitor transactions
window.ethereum.on('transactionHash', (hash) => {
  console.log('Transaction:', hash);
});
```

### Network Debugging
```bash
# Check RPC connection
curl -X POST https://forno.celo.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check gas prices
curl -X POST https://forno.celo.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":1}'
```

## Getting Help

### Resources
- [Documentation](./README.md)
- [API Reference](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)

### Community Support
- Discord: #help channel
- GitHub Issues: Create new issue
- Email: support@agroshield.io

### Reporting Issues
When reporting issues, include:
1. Error message
2. Steps to reproduce
3. Environment details
4. Code snippets
5. Screenshots if applicable

## Prevention Tips

### Development
- Always test on testnet first
- Use environment variables for secrets
- Keep dependencies updated
- Write comprehensive tests

### Deployment
- Double-check network configurations
- Verify contract addresses
- Test with small amounts first
- Use hardware wallets

### Security
- Never share private keys
- Use reputable wallets
- Verify contract addresses
- Keep software updated
