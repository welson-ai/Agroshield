const { ethers } = require("hardhat");
const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");

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
  console.log("=== SIMPLE TRANSACTION SPINNING ===");
  console.log("This script bypasses contract compilation issues");
  console.log("==========================================");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log("Deployer Address:", deployerAddress);

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
    account: deployerAddress
  });

  console.log("Viem clients created successfully");

  // Check balances
  const celoBalance = await deployer.getBalance();
  console.log("CELO Balance:", ethers.utils.formatEther(celoBalance), "CELO");
  
  const cusdBalance = await publicClient.readContract({
    address: CUSD_TOKEN_ADDRESS,
    abi: CUSD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [deployerAddress]
  });
  console.log("cUSD Balance:", formatEther(cusdBalance), "cUSD");

  // Simple test - just check pool stats
  try {
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
      args: [deployerAddress, POOL_ADDRESS]
    });
    
    console.log("Current Allowance:", formatEther(allowance), "cUSD");

    console.log("\n=== SUCCESS! ===");
    console.log("Contract access is working. Ready for full transaction spinning.");
    console.log("To run full spinning, fix contract compilation issues first.");
    
  } catch (error) {
    console.error("Error accessing contracts:", error.message);
    console.log("\n=== TROUBLESHOOTING ===");
    console.log("1. Check if contracts are deployed at the specified addresses");
    console.log("2. Verify you have sufficient CELO for gas fees");
    console.log("3. Ensure you have cUSD tokens in your wallet");
    console.log("4. Check network connectivity");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
