const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// Contract ABIs
const AGROSHIELD_POOL_ABI = [
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
  }
];

const STANDARD_CUSD_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Use standard cUSD token address
const POOL_ADDRESS = "0x5e96ea0e2527f451221fe7efc786d70df316b8c5";
const STANDARD_CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;
const SPIN_AMOUNT = parseEther("0.01"); // 0.01 cUSD per spin

async function main() {
  console.log("🚀 TESTING WITH STANDARD CUSD TOKEN");
  console.log("=====================================");
  
  const privateKey = process.env.PRIVATE_KEY;
  const account = privateKeyToAccount(privateKey);
  console.log("👤 Account Address:", account.address);

  const publicClient = createPublicClient({
    chain: {
      id: CHAIN_ID,
      name: 'Celo',
      nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
      rpcUrls: {
        default: { http: [RPC_URL] },
        public: { http: [RPC_URL] }
      }
    },
    transport: http(RPC_URL)
  });

  const walletClient = createWalletClient({
    chain: {
      id: CHAIN_ID,
      name: 'Celo',
      nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
      rpcUrls: {
        default: { http: [RPC_URL] },
        public: { http: [RPC_URL] }
      }
    },
    transport: http(RPC_URL),
    account: account
  });

  try {
    console.log("\n💰 Checking Standard cUSD Token...");
    
    // Check standard cUSD token
    const cusdBalance = await publicClient.readContract({
      address: STANDARD_CUSD_ADDRESS,
      abi: STANDARD_CUSD_ABI,
      functionName: 'balanceOf',
      args: [account.address]
    });
    console.log("💵 Standard cUSD Balance:", formatEther(cusdBalance), "cUSD");

    if (cusdBalance < SPIN_AMOUNT) {
      console.error("❌ Insufficient standard cUSD balance");
      console.log("💡 Get standard cUSD from: https://app.ubeswap.org/");
      process.exit(1);
    }

    console.log("\n🧪 Testing Single Transaction...");
    
    // Try to approve standard cUSD for the pool
    console.log("1. Approving standard cUSD...");
    const approveHash = await walletClient.writeContract({
      address: STANDARD_CUSD_ADDRESS,
      abi: STANDARD_CUSD_ABI,
      functionName: 'approve',
      args: [POOL_ADDRESS, SPIN_AMOUNT]
    });

    console.log("📤 Approve TX:", approveHash);
    const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveHash });
    console.log("✅ Approval confirmed in block:", approveReceipt.blockNumber);

    // Try to provide liquidity
    console.log("2. Providing liquidity...");
    const depositHash = await walletClient.writeContract({
      address: POOL_ADDRESS,
      abi: AGROSHIELD_POOL_ABI,
      functionName: 'provideLiquidity',
      args: [SPIN_AMOUNT]
    });

    console.log("📤 Deposit TX:", depositHash);
    const depositReceipt = await publicClient.waitForTransactionReceipt({ hash: depositHash });
    console.log("✅ Deposit confirmed in block:", depositReceipt.blockNumber);

    console.log("\n🎉 SUCCESS! Transaction completed with standard cUSD");
    console.log("📊 Final cUSD Balance:", formatEther(
      await publicClient.readContract({
        address: STANDARD_CUSD_ADDRESS,
        abi: STANDARD_CUSD_ABI,
        functionName: 'balanceOf',
        args: [account.address]
      })
    ), "cUSD");

  } catch (error) {
    console.error("❌ Transaction failed:", error.message);
    
    if (error.message.includes("transfer failed") || error.message.includes("ERC20")) {
      console.log("\n💡 This suggests the pool contract expects a different token");
      console.log("The deployed contract may be configured for a test token");
      console.log("You may need to:");
      console.log("1. Deploy a new pool with standard cUSD");
      console.log("2. Get the test token that the pool expects");
      console.log("3. Use the testnet version instead");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
