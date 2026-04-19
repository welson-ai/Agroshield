const { createPublicClient, http } = require("viem");
require('dotenv').config();

// Contract configuration
const POOL_ADDRESS = "0x369b50a492e9de0e4989910bd3594aebd89b5d21";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;

async function main() {
  console.log("=== CHECKING TOKEN DETAILS ===");
  
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
    const cusdTokenAddress = await publicClient.readContract({
      address: POOL_ADDRESS,
      abi: [{"inputs": [], "name": "cusdToken", "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"}],
      functionName: 'cusdToken'
    });
    
    console.log("Contract cUSD Token Address:", cusdTokenAddress);
    
    // Check if this is a valid ERC20 token
    const tokenABI = [
      {"inputs": [], "name": "name", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
      {"inputs": [], "name": "symbol", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
      {"inputs": [], "name": "decimals", "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}], "stateMutability": "view", "type": "function"},
      {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}
    ];
    
    try {
      const name = await publicClient.readContract({
        address: cusdTokenAddress,
        abi: tokenABI,
        functionName: 'name'
      });
      console.log("Token Name:", name);
    } catch (e) {
      console.log("Could not read token name");
    }
    
    try {
      const symbol = await publicClient.readContract({
        address: cusdTokenAddress,
        abi: tokenABI,
        functionName: 'symbol'
      });
      console.log("Token Symbol:", symbol);
    } catch (e) {
      console.log("Could not read token symbol");
    }
    
    try {
      const decimals = await publicClient.readContract({
        address: cusdTokenAddress,
        abi: tokenABI,
        functionName: 'decimals'
      });
      console.log("Token Decimals:", decimals.toString());
    } catch (e) {
      console.log("Could not read token decimals");
    }
    
    try {
      const balance = await publicClient.readContract({
        address: cusdTokenAddress,
        abi: tokenABI,
        functionName: 'balanceOf',
        args: ['0xEA65d20f0D3B6b77e467CF1FeCE21F7bc3166470']
      });
      console.log("Our Token Balance:", balance.toString());
    } catch (e) {
      console.log("Could not read token balance");
    }
    
    console.log("\n=== SOLUTION ===");
    console.log("Update your script to use this token address:");
    console.log("const CUSD_TOKEN_ADDRESS =", cusdTokenAddress + ";");
    
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
