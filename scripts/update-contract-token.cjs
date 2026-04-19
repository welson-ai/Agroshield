const { createPublicClient, createWalletClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// ABI to update contract token (if contract has such function)
const UPDATE_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_newCusdToken", "type": "address"}
    ],
    "name": "updateCusdToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function main() {
  console.log("🔧 UPDATING CONTRACT TOKEN ADDRESS");
  console.log("===================================");
  
  const privateKey = process.env.PRIVATE_KEY;
  const account = privateKeyToAccount(privateKey);
  console.log("👤 Account Address:", account.address);

  const publicClient = createPublicClient({
    chain: {
      id: 42220,
      name: 'Celo',
      nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://forno.celo.org'] },
        public: { http: ['https://forno.celo.org'] }
      }
    },
    transport: http('https://forno.celo.org')
  });

  const walletClient = createWalletClient({
    chain: {
      id: 42220,
      name: 'Celo',
      nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://forno.celo.org'] },
        public: { http: ['https://forno.celo.org'] }
      }
    },
    transport: http('https://forno.celo.org'),
    account: account
  });

  try {
    const POOL_ADDRESS = "0xef65b6fe2e9de3fa865aa87107db4bcd458115d5";
    const NEW_CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
    
    console.log("📍 Pool Contract:", POOL_ADDRESS);
    console.log("🔄 New cUSD Token:", NEW_CUSD_ADDRESS);

    // Check if contract has update function
    try {
      const code = await publicClient.getBytecode({ address: POOL_ADDRESS });
      if (!code || code === '0x') {
        console.log("❌ Contract not found");
        return;
      }

      console.log("✅ Contract found, attempting update...");
      
      // Try to call update function (if it exists)
      const updateHash = await walletClient.writeContract({
        address: POOL_ADDRESS,
        abi: UPDATE_ABI,
        functionName: 'updateCusdToken',
        args: [NEW_CUSD_ADDRESS]
      });

      console.log("📤 Update TX:", updateHash);
      
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash: updateHash 
      });
      
      console.log("✅ Token updated in block:", receipt.blockNumber);
      console.log("🎊 Contract now uses standard cUSD!");
      
    } catch (error) {
      console.log("❌ Update function not available:", error.message);
      console.log("\n💡 SOLUTION: Deploy new contract instead");
      console.log("Run: npm run deploy");
    }

  } catch (error) {
    console.error("Script failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
