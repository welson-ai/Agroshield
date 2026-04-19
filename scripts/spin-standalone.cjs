const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// Contract ABIs (minimal for functions we need)
const AGROSHIELD_POOL_ABI = [
  {
    "inputs": [],
    "name": "getPoolStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalLiquidity", "type": "uint256"},
      {"internalType": "uint256", "name": "totalPolicies", "type": "uint256"},
      {"internalType": "uint256", "name": "totalPremiums", "type": "uint256"},
      {"internalType": "uint256", "name": "totalPayouts", "type": "uint256"},
      {"internalType": "uint256", "name": "activePolicies", "type": "uint256"}
    ],
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
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "withdrawLiquidity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const CUSD_TOKEN_ABI = [
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

// Contract configuration
const POOL_ADDRESS = "0x369b50a492e9de0e4989910bd3594aebd89b5d21";
const CUSD_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;
const SPIN_AMOUNT = parseEther("0.01"); // 0.01 cUSD per spin

async function main() {
  console.log("=== STANDALONE TRANSACTION SPINNING ===");
  console.log("This script bypasses Hardhat completely");
  console.log("==========================================");
  
  // Check environment
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("ERROR: PRIVATE_KEY not found in .env file");
    console.log("Please create a .env file with your private key:");
    console.log("PRIVATE_KEY=0x1234567890abcdef...");
    process.exit(1);
  }

  // Create account from private key
  const account = privateKeyToAccount(privateKey);
  console.log("Account Address:", account.address);

  // Create viem clients
  const publicClient = createPublicClient({
    chain: {
      id: CHAIN_ID,
      name: 'Celo',
      nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
      rpcUrls: {
        default: { http: [RPC_URL] },
        public: { http: [RPC_URL] }
      },
      blockExplorers: {
        default: { name: 'Celo Explorer', url: 'https://celoscan.io' }
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
      },
      blockExplorers: {
        default: { name: 'Celo Explorer', url: 'https://celoscan.io' }
      }
    },
    transport: http(RPC_URL),
    account: account
  });

  console.log("Viem clients created successfully");

  try {
    // Check balances
    const celoBalance = await publicClient.getBalance({ address: account.address });
    console.log("CELO Balance:", formatEther(celoBalance), "CELO");
    
    const cusdBalance = await publicClient.readContract({
      address: CUSD_TOKEN_ADDRESS,
      abi: CUSD_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [account.address]
    });
    console.log("cUSD Balance:", formatEther(cusdBalance), "cUSD");

    // Check pool stats
    console.log("\n=== TESTING POOL CONTRACT ACCESS ===");
    
    const stats = await publicClient.readContract({
      address: POOL_ADDRESS,
      abi: AGROSHIELD_POOL_ABI,
      functionName: 'getPoolStats'
    });

    console.log("Pool Stats:");
    console.log("  Total Liquidity:", formatEther(stats[0]), "cUSD");
    console.log("  Total Policies:", stats[1].toString());
    console.log("  Total Premiums:", formatEther(stats[2]), "cUSD");
    console.log("  Total Payouts:", formatEther(stats[3]), "cUSD");
    console.log("  Active Policies:", stats[4].toString());

    console.log("\n=== TESTING cUSD TOKEN ACCESS ===");
    
    const allowance = await publicClient.readContract({
      address: CUSD_TOKEN_ADDRESS,
      abi: CUSD_TOKEN_ABI,
      functionName: 'allowance',
      args: [account.address, POOL_ADDRESS]
    });
    
    console.log("Current Allowance:", formatEther(allowance), "cUSD");

    console.log("\n=== READY FOR TRANSACTION SPINNING ===");
    console.log("All contract access is working!");
    console.log("You can now proceed with the full spinning script.");
    console.log("\nTo run the full spinning:");
    console.log("1. Fix contract compilation issues first");
    console.log("2. Then run: npm run spin");
    
    // Optional: Test a single approval
    if (allowance < SPIN_AMOUNT) {
      console.log("\n=== TESTING SINGLE APPROVAL ===");
      
      const approveHash = await walletClient.writeContract({
        address: CUSD_TOKEN_ADDRESS,
        abi: CUSD_TOKEN_ABI,
        functionName: 'approve',
        args: [POOL_ADDRESS, SPIN_AMOUNT * BigInt(2)]
      });

      console.log("Approve TX Hash:", approveHash);
      console.log("CeloScan Link: https://celoscan.io/tx/" + approveHash);

      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: approveHash 
      });
      
      console.log("Approval confirmed in block:", receipt.blockNumber);
      console.log("Gas Used:", receipt.gasUsed.toString());
      
      console.log("\n=== APPROVAL SUCCESSFUL! ===");
    } else {
      console.log("\n=== SUFFICIENT ALLOWANCE EXISTS ===");
    }

  } catch (error) {
    console.error("Error:", error.message);
    console.log("\n=== TROUBLESHOOTING ===");
    console.log("1. Check if contracts are deployed at the specified addresses");
    console.log("2. Verify you have sufficient CELO for gas fees");
    console.log("3. Ensure you have cUSD tokens in your wallet");
    console.log("4. Check network connectivity");
    console.log("5. Verify your private key is correct");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
