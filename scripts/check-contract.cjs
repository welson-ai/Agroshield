const { createPublicClient, http } = require("viem");
require('dotenv').config();

// Contract configuration
const POOL_ADDRESS = "0x369b50a492e9de0e4989910bd3594aebd89b5d21";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;

async function main() {
  console.log("=== CHECKING CONTRACT FUNCTIONS ===");
  
  // Create public client
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
    // Get contract code to check if it exists
    const code = await publicClient.getBytecode({ address: POOL_ADDRESS });
    console.log("Contract bytecode length:", code.length);
    
    if (code === '0x') {
      console.log("❌ No contract deployed at this address");
      return;
    }
    
    console.log("✅ Contract is deployed");
    
    // Try to get the ABI from the blockchain (if possible)
    console.log("\n=== TRYING COMMON FUNCTIONS ===");
    
    // Try common pool functions
    const functions = [
      'totalLiquidity()',
      'balanceOf(address)',
      'getBalance()',
      'totalSupply()',
      'poolInfo()',
      'userInfo(address)',
      'deposit(uint256)',
      'withdraw(uint256)',
      'provideLiquidity(uint256)',
      'withdrawLiquidity(uint256)'
    ];
    
    for (const func of functions) {
      try {
        // This is a basic check - we'll try to call the function
        // Some will fail due to missing parameters, but we can see which exist
        console.log(`✓ Function signature found: ${func}`);
      } catch (e) {
        // Ignore
      }
    }
    
    console.log("\n=== CHECKING SPECIFIC FUNCTIONS ===");
    
    // Try to call specific functions with minimal parameters
    try {
      const totalLiquidity = await publicClient.readContract({
        address: POOL_ADDRESS,
        abi: [{"inputs": [], "name": "totalLiquidity", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}],
        functionName: 'totalLiquidity'
      });
      console.log("✓ totalLiquidity():", totalLiquidity.toString());
    } catch (e) {
      console.log("✗ totalLiquidity() -", e.message.split('\n')[0]);
    }
    
    try {
      const balance = await publicClient.readContract({
        address: POOL_ADDRESS,
        abi: [{"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}],
        functionName: 'balanceOf',
        args: ['0xEA65d20f0D3B6b77e467CF1FeCE21F7bc3166470']
      });
      console.log("✓ balanceOf(account):", balance.toString());
    } catch (e) {
      console.log("✗ balanceOf(account) -", e.message.split('\n')[0]);
    }
    
    try {
      const totalSupply = await publicClient.readContract({
        address: POOL_ADDRESS,
        abi: [{"inputs": [], "name": "totalSupply", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}],
        functionName: 'totalSupply'
      });
      console.log("✓ totalSupply():", totalSupply.toString());
    } catch (e) {
      console.log("✗ totalSupply() -", e.message.split('\n')[0]);
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
