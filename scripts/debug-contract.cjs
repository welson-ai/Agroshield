const { createPublicClient, http } = require("viem");
require('dotenv').config();

const POOL_ADDRESS = "0xef65b6fe2e9de3fa865aa87107db4bcd458115d5";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;

async function main() {
  console.log("🔍 DEBUGGING CONTRACT FUNCTIONS");
  console.log("=================================");
  
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
    // Check what functions actually exist
    console.log("📋 Testing Common Function Names...");
    
    const functions = [
      { name: 'provideLiquidity', inputs: ['uint256'] },
      { name: 'deposit', inputs: ['uint256'] },
      { name: 'addLiquidity', inputs: ['uint256'] },
      { name: 'stake', inputs: ['uint256'] },
      { name: 'contribute', inputs: ['uint256'] },
      { name: 'provideLiquidityETH', inputs: ['uint256'] },
      { name: 'provideLiquidityNative', inputs: ['uint256'] }
    ];
    
    for (const func of functions) {
      try {
        let abi = [{
          "inputs": func.inputs.map((input, i) => 
            input === 'uint256' ? {"internalType": "uint256", "name": `param${i}`, "type": "uint256"} :
            {"internalType": "address", "name": `param${i}`, "type": "address"}
          ), 
          "name": func.name, 
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], 
          "stateMutability": "view", 
          "type": "function"
        }];
        
        let args = [];
        if (func.inputs.includes('uint256')) {
          args = [1000000000000000n]; // 0.001 CELO
        }
        
        const result = await publicClient.readContract({
          address: POOL_ADDRESS,
          abi: abi,
          functionName: func.name,
          args: args
        });
        
        console.log(`✅ ${func.name}():`, result.toString());
      } catch (e) {
        console.log(`❌ ${func.name}(): ${e.message.split('\n')[0]}`);
      }
    }
    
    // Check if contract is actually a pool contract
    console.log("\n🔍 Checking Contract Type...");
    
    try {
      const code = await publicClient.getBytecode({ address: POOL_ADDRESS });
      if (code && code.length > 2) {
        console.log("✅ Contract bytecode length:", code.length);
        
        // Try to get any public variables
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
      }
    } catch (e) {
      console.log("❌ Could not read bytecode:", e.message);
    }
    
    console.log("\n💡 POSSIBLE SOLUTIONS:");
    console.log("1. Contract might be different type (not liquidity pool)");
    console.log("2. Functions might have different names");
    console.log("3. Contract might require initialization");
    console.log("4. Contract might be paused or have restrictions");
    
  } catch (error) {
    console.error("Debug failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
