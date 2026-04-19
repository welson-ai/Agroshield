# API Documentation

## 🌐 AgroShield API Reference

This document provides comprehensive API information for integrating with AgroShield smart contracts.

## 🔗 Contract Addresses

### 🌐 Celo Mainnet
```javascript
const CONTRACTS = {
  AGROSHIELD_POOL: "0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6",
  CUSD_TOKEN: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  RPC_URL: "https://forno.celo.org"
};
```

## 💰 AgroShieldPool API

### 📋 Core Functions

#### provideLiquidity(uint256 amount)
```javascript
// Deposit cUSD into the liquidity pool
const tx = await poolContract.provideLiquidity(
  parseEther("0.01") // 0.01 cUSD
);
```

#### withdrawLiquidity(uint256 shares)
```javascript
// Withdraw cUSD from the liquidity pool
const tx = await poolContract.withdrawLiquidity(
  userShares // Amount of shares to withdraw
);
```

#### totalLiquidity()
```javascript
// Get total pool liquidity
const totalLiquidity = await poolContract.totalLiquidity();
// Returns: BigNumber (in wei)
```

#### userDeposits(address user)
```javascript
// Get user's total deposits
const deposits = await poolContract.userDeposits(
  "0xUserAddress..."
);
// Returns: BigNumber (in wei)
```

#### userShares(address user)
```javascript
// Get user's total shares
const shares = await poolContract.userShares(
  "0xUserAddress..."
);
// Returns: BigNumber (in wei)
```

### 📊 Pool Statistics

#### getPoolStats()
```javascript
const stats = await poolContract.getPoolStats();
// Returns: {
//   liquidity: "1000000000000000000",     // Total liquidity
//   reserve: "500000000000000000",      // Reserve amount
//   activePayouts: "100000000000000000", // Active payouts
//   totalShares: "1000000000000000000",  // Total shares
//   utilizationRate: "5000"              // Utilization in basis points
// }
```

#### getUserPosition(address user)
```javascript
const position = await poolContract.getUserPosition(
  "0xUserAddress..."
);
// Returns: {
//   deposits: "1000000000000000000",    // User deposits
//   shares: "1000000000000000000",     // User shares
//   sharePercentage: "10000"            // Share percentage (10000 = 100%)
// }
```

## 🌡️ Events

### LiquidityProvided
```javascript
// Emitted when liquidity is provided
poolContract.on("LiquidityProvided", (provider, amount, shares) => {
  console.log(`Provider: ${provider}`);
  console.log(`Amount: ${formatEther(amount)} cUSD`);
  console.log(`Shares: ${shares.toString()}`);
});
```

### LiquidityWithdrawn
```javascript
// Emitted when liquidity is withdrawn
poolContract.on("LiquidityWithdrawn", (provider, amount, shares) => {
  console.log(`Provider: ${provider}`);
  console.log(`Amount: ${formatEther(amount)} cUSD`);
  console.log(`Shares: ${shares.toString()}`);
});
```

## 🔧 Integration Examples

### 🚀 Viem Integration
```javascript
import { createWalletClient, createPublicClient, http, parseEther } from "viem";
import { celo } from "viem/chains";

const publicClient = createPublicClient({
  chain: celo,
  transport: http(CONTRACTS.RPC_URL)
});

const walletClient = createWalletClient({
  chain: celo,
  transport: http(CONTRACTS.RPC_URL),
  account: privateKeyToAccount(process.env.PRIVATE_KEY)
});

// Deposit cUSD
const depositTx = await walletClient.writeContract({
  address: CONTRACTS.AGROSHIELD_POOL,
  abi: AGROSHIELD_POOL_ABI,
  functionName: 'provideLiquidity',
  args: [parseEther("0.01")]
});
```

### 📊 Ethers.js Integration
```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(CONTRACTS.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACTS.AGROSHIELD_POOL, AGROSHIELD_POOL_ABI, wallet);

// Deposit cUSD
const tx = await contract.provideLiquidity(
  ethers.utils.parseEther("0.01")
);
await tx.wait();
```

### 🌐 Web3.js Integration
```javascript
import Web3 from "web3";

const web3 = new Web3(CONTRACTS.RPC_URL);
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
const contract = new web3.eth.Contract(AGROSHIELD_POOL_ABI, CONTRACTS.AGROSHIELD_POOL);

// Deposit cUSD
const tx = await contract.methods.provideLiquidity(
  web3.utils.toWei("0.01", "ether")
).send({ from: account.address });
```

## 📊 ABI Reference

### AgroShieldPool ABI
```json
[
  {
    "inputs": [],
    "name": "totalLiquidity",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "provideLiquidity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "shares", "type": "uint256"}
    ],
    "name": "withdrawLiquidity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "userDeposits",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "userShares",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]
```

## 📈 Error Handling

### Common Errors
```javascript
try {
  await contract.provideLiquidity(amount);
} catch (error) {
  if (error.message.includes("ERC20: insufficient allowance")) {
    // Handle allowance error
    await approveToken(amount);
  } else if (error.message.includes("Transfer failed")) {
    // Handle transfer error
    console.error("Insufficient cUSD balance");
  } else if (error.message.includes("ReentrancyGuard")) {
    // Handle reentrancy error
    console.error("Reentrancy detected");
  }
}
```

### Gas Estimation
```javascript
// Estimate gas before transaction
const gasEstimate = await publicClient.estimateContractGas({
  address: CONTRACTS.AGROSHIELD_POOL,
  abi: AGROSHIELD_POOL_ABI,
  functionName: 'provideLiquidity',
  args: [parseEther("0.01")]
});

console.log(`Estimated gas: ${gasEstimate.toString()}`);
```

## 🔍 Monitoring

### Transaction Status
```javascript
// Monitor transaction confirmation
const receipt = await publicClient.waitForTransactionReceipt({
  hash: transactionHash
});

console.log(`Status: ${receipt.status}`); // success, reverted
console.log(`Gas used: ${receipt.gasUsed.toString()}`);
console.log(`Block number: ${receipt.blockNumber.toString()}`);
```

### Event Listening
```javascript
// Listen for liquidity events
publicClient.watchEvent({
  address: CONTRACTS.AGROSHIELD_POOL,
  abi: AGROSHIELD_POOL_ABI,
  eventName: 'LiquidityProvided'
}, (log) => {
  console.log('New liquidity provided:', log.args);
});
```

## 📊 Rate Limits

### Recommended Limits
- **Transactions/minute**: 30
- **Gas limit/transaction**: 200,000
- **Concurrent requests**: 5
- **Batch size**: 10 transactions

### Best Practices
- **Batch transactions**: When possible
- **Monitor gas**: Adjust based on network conditions
- **Handle errors**: Graceful retry logic
- **Cache data**: Reduce redundant calls

## 🔗 Useful Links

- **CeloScan**: https://celoscan.io/address/0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6
- **Celo Documentation**: https://docs.celo.org/
- **Viem Docs**: https://viem.sh/
- **Contract Source**: https://celoscan.io/address/0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6#code

---

**Ready for integration! 🚀**
