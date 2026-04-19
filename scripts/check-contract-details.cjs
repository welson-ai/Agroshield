const { createPublicClient, http } = require("viem");
require('dotenv').config();

// Contract configuration
const POOL_ADDRESS = "0x369b50a492e9de0e4989910bd3594aebd89b5d21";
const CUSD_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;

async function main() {
  console.log("=== CHECKING CONTRACT DETAILS ===");
  
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

  try {
    // Get the cUSD token address from the contract
    console.log("📋 Checking contract configuration...");
    
    try {
      const cusdTokenAddress = await publicClient.readContract({
        address: POOL_ADDRESS,
        abi: [{"inputs": [], "name": "cusdToken", "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"}],
        functionName: 'cusdToken'
      });
      console.log("✅ Contract cUSD Token Address:", cusdTokenAddress);
      console.log("📍 Expected cUSD Address:", CUSD_TOKEN_ADDRESS);
      
      if (cusdTokenAddress.toLowerCase() === CUSD_TOKEN_ADDRESS.toLowerCase()) {
        console.log("✅ Token addresses match!");
      } else {
        console.log("❌ Token addresses don't match!");
        console.log("This might be the issue - contract is configured for a different token");
      }
    } catch (e) {
      console.log("❌ Could not read cusdToken address:", e.message.split('\n')[0]);
    }

    // Check other contract variables
    try {
      const totalLiquidity = await publicClient.readContract({
        address: POOL_ADDRESS,
        abi: [{"inputs": [], "name": "totalLiquidity", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}],
        functionName: 'totalLiquidity'
      });
      console.log("💰 Total Liquidity:", totalLiquidity.toString());
    } catch (e) {
      console.log("❌ Could not read totalLiquidity:", e.message.split('\n')[0]);
    }

    try {
      const totalShares = await publicClient.readContract({
        address: POOL_ADDRESS,
        abi: [{"inputs": [], "name": "totalShares", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}],
        functionName: 'totalShares'
      });
      console.log("📊 Total Shares:", totalShares.toString());
    } catch (e) {
      console.log("❌ Could not read totalShares:", e.message.split('\n')[0]);
    }

    try {
      const owner = await publicClient.readContract({
        address: POOL_ADDRESS,
        abi: [{"inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"}],
        functionName: 'owner'
      });
      console.log("👤 Contract Owner:", owner);
    } catch (e) {
      console.log("❌ Could not read owner:", e.message.split('\n')[0]);
    }

    // Check user deposits for our account
    try {
      const userDeposits = await publicClient.readContract({
        address: POOL_ADDRESS,
        abi: [{"inputs": [{"internalType": "address", "name": "", "type": "address"}], "name": "userDeposits", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}],
        functionName: 'userDeposits',
        args: ['0xEA65d20f0D3B6b77e467CF1FeCE21F7bc3166470']
      });
      console.log("💵 User Deposits:", userDeposits.toString());
    } catch (e) {
      console.log("❌ Could not read userDeposits:", e.message.split('\n')[0]);
    }

    try {
      const userShares = await publicClient.readContract({
        address: POOL_ADDRESS,
        abi: [{"inputs": [{"internalType": "address", "name": "", "type": "address"}], "name": "userShares", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}],
        functionName: 'userShares',
        args: ['0xEA65d20f0D3B6b77e467CF1FeCE21F7bc3166470']
      });
      console.log("📊 User Shares:", userShares.toString());
    } catch (e) {
      console.log("❌ Could not read userShares:", e.message.split('\n')[0]);
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
