const { createPublicClient, http } = require("viem");
require('dotenv').config();

const POOL_ADDRESS = "0x5e96ea0e2527f451221fe7efc786d70df316b8c5";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;

async function main() {
  console.log("=== CHECKING NEW CONTRACT FUNCTIONS ===");
  
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
    // Check if contract exists
    const code = await publicClient.getBytecode({ address: POOL_ADDRESS });
    console.log("Contract bytecode:", code ? code.length : 'undefined');
    
    if (!code || code === '0x' || code.length === 2) {
      console.log("❌ No contract deployed at this address");
      return;
    }
    
    console.log("✅ Contract is deployed");
    
    // Test common functions
    const functions = [
      { name: 'totalLiquidity', inputs: [] },
      { name: 'balanceOf', inputs: ['address'] },
      { name: 'userDeposits', inputs: ['address'] },
      { name: 'userShares', inputs: ['address'] },
      { name: 'totalShares', inputs: [] },
      { name: 'cusdToken', inputs: [] },
      { name: 'owner', inputs: [] }
    ];
    
    for (const func of functions) {
      try {
        let args = [];
        if (func.inputs.includes('address')) {
          args = ['0xEA65d20f0D3B6b77e467CF1FeCE21F7bc3166470'];
        }
        
        const result = await publicClient.readContract({
          address: POOL_ADDRESS,
          abi: [{"inputs": func.inputs.map((input, i) => 
            input === 'address' ? {"internalType": "address", "name": `param${i}`, "type": "address"} :
            {"internalType": "uint256", "name": `param${i}`, "type": "uint256"}
          ), "name": func.name, "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}],
          functionName: func.name,
          args: args
        });
        
        console.log(`✅ ${func.name}():`, result.toString());
      } catch (e) {
        console.log(`❌ ${func.name}(): ${e.message.split('\n')[0]}`);
      }
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
