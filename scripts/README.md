# Transaction Spinning Scripts

This directory contains scripts for automated transaction execution on AgroShield contracts.

## 🚀 Spin Transactions Script

### Overview
The `spin-transactions.js` script performs automated transactions on the AgroShieldPool contract on Celo mainnet. It's designed to test contract functionality and generate transaction volume.

### What It Does
For each iteration (10 total), the script performs:
1. **Check Pool Stats** - Read current pool statistics
2. **Deposit Liquidity** - Provide 0.01 CELO to the pool
3. **Withdraw Liquidity** - Withdraw 0.005 CELO from the pool

### Configuration
- **Contract**: AgroShieldPool at `0x369b50a492e9de0e4989910bd3594aebd89b5d21`
- **Network**: Celo Mainnet (Chain ID: 42220)
- **RPC**: https://forno.celo.org
- **Iterations**: 10
- **Deposit Amount**: 0.01 CELO per iteration
- **Withdraw Amount**: 0.005 CELO per iteration
- **Delay**: 3 seconds between iterations

## 🛠️ Prerequisites

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file in the project root:
   ```
   PRIVATE_KEY=your_private_key_here
   ```

3. **Fund Your Account**:
   Ensure your account has at least 0.1 CELO for gas fees.

## 🚀 Running the Script

### Method 1: Using npm script
```bash
npm run spin
```

### Method 2: Using Hardhat directly
```bash
npx hardhat run scripts/spin-transactions.js --network celo-mainnet
```

## 📊 Output Example

```
🚀 Starting Transaction Spinning on Celo Mainnet
📍 Pool Contract: 0x369b50a492e9de0e4989910bd3594aebd89b5d21
🌐 RPC URL: https://forno.celo.org
⛓️  Chain ID: 42220

👤 Deployer Address: 0x1234...
💰 Current Balance: 1.5 CELO

🔄 Starting 10 transaction spins...
💸 Deposit Amount: 0.01 CELO
🏧 Withdraw Amount: 0.005 CELO

📍 Spin 1/10
==================================================
📊 1. Checking pool stats...
   📈 Pool Stats:
      Total Liquidity: 1000.5 CELO
      Total Policies: 25
      Total Premiums: 150.25 CELO
      Total Payouts: 75.5 CELO
      Active Policies: 12

💰 2. Depositing liquidity...
   📤 Deposit TX: https://celoscan.io/tx/0xabc123...
   ✅ Deposit confirmed in block 12345
   ⛽ Gas Used: 45000

🏧 3. Withdrawing liquidity...
   📥 Withdraw TX: https://celoscan.io/tx/0xdef456...
   ✅ Withdraw confirmed in block 12346
   ⛽ Gas Used: 38000

🎉 Spin 1 completed successfully!
⏳ Waiting 3 seconds before next spin...

==================================================
📊 TRANSACTION SPINNING SUMMARY
==================================================
✅ Successful Spins: 10/10
❌ Failed Spins: 0/10
📈 Success Rate: 100.0%
⛽ Total Gas Used: 830000
💸 Total Deposited: 0.1 CELO
🏧 Total Withdrawn: 0.05 CELO
💰 Final Balance: 1.45 CELO
📉 Balance Change: -0.05 CELO

🎊 ALL TRANSACTIONS COMPLETED SUCCESSFULLY!
```

## ⚠️ Important Notes

### Security
- **NEVER** commit your private key to version control
- Use a dedicated testing account with limited funds
- Double-check the contract address before running

### Gas Costs
- Each spin consumes approximately 83,000 gas
- Total cost for 10 spins: ~0.05 CELO in gas fees
- Gas price is set to 20 gwei (adjustable in hardhat.config.ts)

### Network Considerations
- Script uses Celo's public RPC (forno.celo.org)
- May experience delays during network congestion
- Consider using a private RPC for production use

## 🔧 Customization

### Modify Transaction Parameters
Edit these variables in `spin-transactions.js`:
```javascript
const SPIN_COUNT = 10;              // Number of iterations
const DEPOSIT_AMOUNT = parseEther("0.01");  // Deposit amount
const WITHDRAW_AMOUNT = parseEther("0.005"); // Withdraw amount
```

### Change Contract Address
```javascript
const POOL_ADDRESS = "0x369b50a492e9de0e4989910bd3594aebd89b5d21";
```

### Adjust Network Settings
Edit `hardhat.config.ts`:
```javascript
gasPrice: 20000000000, // 20 gwei (adjust as needed)
gas: 2100000,         // Gas limit (adjust as needed)
```

## 🐛 Troubleshooting

### Common Issues

1. **Insufficient Balance**
   ```
   ❌ Insufficient balance. Need at least 0.1 CELO for gas fees.
   ```
   **Solution**: Fund your account with more CELO

2. **Private Key Not Found**
   ```
   Error: No private key provided
   ```
   **Solution**: Add `PRIVATE_KEY=your_key` to `.env` file

3. **Network Connection Issues**
   ```
   Error: Network connection timeout
   ```
   **Solution**: Check internet connection, try again later

4. **Contract Not Found**
   ```
   Error: Contract not deployed at address
   ```
   **Solution**: Verify contract address is correct

### Debug Mode
Add more logging by modifying the script:
```javascript
// Add debug logging
console.log("Debug: Contract call data:", callData);
```

## 📈 Monitoring

### Track Transactions
- All transaction hashes are logged with CeloScan links
- Monitor gas usage and success rates
- Check final balance changes

### Performance Metrics
The script tracks:
- Success/failure rate
- Total gas consumed
- Balance changes
- Transaction confirmations

## 🚨 Safety Checklist

Before running the script:

- [ ] Private key is secure and not committed
- [ ] Test account has sufficient CELO
- [ ] Contract address is verified
- [ ] Network settings are correct
- [ ] Gas price is reasonable
- [ ] You understand the costs

## 📞 Support

If you encounter issues:

1. Check this README for common solutions
2. Review the error messages carefully
3. Verify your environment setup
4. Test with smaller amounts first

## 🔄 Related Scripts

- `deploy-pool.js` - Deploy contracts to testnet
- `test/` - Comprehensive test suite
- Frontend transaction spinning - Web-based automation

---

**⚠️ WARNING**: This script performs real transactions on Celo mainnet. Use with caution and only with funds you're willing to lose in gas fees.
