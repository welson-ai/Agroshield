const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// AgroShieldPool ABI for deployment
const AGROSHIELD_POOL_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_cusdToken", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
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
  }
];

// AgroShieldPool bytecode (simplified version)
const AGROSHIELD_POOL_BYTECODE = "0x608060405234801561001057600080fd5b506040516104d53803806104d5833981016040819052610030916100a2565b6001600160a01b031916331790819061004b9082906000906100c2565b50505050610162565b600080604083850121561006457600080fd5b5060405191508082528060208301526020820150509250929050565b600080604083850121561009257600080fd5b5060405191508082528060208301526020820150509250929050565b82815260200190565b6000602082840312156100cb57600080fd5b81516001600160a01b03811681146100e257600080fd5b9392505050565b80516001600160a01b03811681146100e257600080fd5b6002811061010757600080fd5b50565b610300806101166000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063893d20e81461003b578063a9059cbb14610059578063dd62ed3e14610077575b600080fd5b6100436100a3565b6040516100509190610140565b60405180910390f35b61006d6004803603810190610068919061019b565b6100a5565b60405161007a91906101d6565b60405180910390f35b6100a1600480360381019061009c91906101f1565b6100b8565b005b60005481565b60008181526020019081526020016000205490565b6000808284019050828111156100e3576100e26100f4565b5b9250929050565b600080fd5b6100fd610118565b60405161010a9190610140565b60405180910390f35b61011d61011e565b005b60008181526020019081526020016000205490565b600080fd5b6000819050919050565b610149806101276000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063893d20e81461003b578063a9059cbb14610059578063dd62ed3e14610077575b600080fd5b6100436100a3565b6040516100509190610140565b60405180910390f35b61006d6004803603810190610068919061019b565b6100a5565b60405161007a91906101d6565b60405180910390f35b6100a1600480360381019061009c91906101f1565b6100b8565b005b60005481565b60008181526020019081526020016000205490565b6000808284019050828111156100e3576100e26100f4565b5b9250929050565b600080fd5b6100fd610118565b60405161010a9190610140565b60405180910390f35b61011d61011e565b005b60008181526020019081526020016000205490565b600080fd5b6000819050919050565b610149806101276000396000f3";

async function main() {
  console.log("🚀 DEPLOYING NEW AGROSHIELD POOL");
  console.log("================================");
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("ERROR: PRIVATE_KEY not found in .env file");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey);
  console.log("👤 Deployer Address:", account.address);

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
    console.log("\n💰 Checking deployer balance...");
    const balance = await publicClient.getBalance({ address: account.address });
    console.log("CELO Balance:", formatEther(balance), "CELO");

    if (balance < parseEther("0.1")) {
      console.error("❌ Insufficient balance. Need at least 0.1 CELO for deployment");
      process.exit(1);
    }

    console.log("\n📋 Deployment Configuration:");
    const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
    console.log("cUSD Token Address:", CUSD_ADDRESS);

    console.log("\n🚀 Deploying contract...");
    
    // Deploy the contract
    const deployHash = await walletClient.deployContract({
      abi: AGROSHIELD_POOL_ABI,
      bytecode: AGROSHIELD_POOL_BYTECODE,
      args: [CUSD_ADDRESS],
      gas: 3000000
    });

    console.log("📤 Deploy Transaction:", deployHash);
    console.log("🔗 CeloScan: https://celoscan.io/tx/" + deployHash);

    console.log("\n⏳ Waiting for deployment confirmation...");
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash: deployHash 
    });

    if (receipt.contractAddress) {
      console.log("\n🎊 DEPLOYMENT SUCCESSFUL!");
      console.log("================================");
      console.log("📍 New Contract Address:", receipt.contractAddress);
      console.log("🔗 CeloScan: https://celoscan.io/address/" + receipt.contractAddress);
      console.log("⛽ Gas Used:", receipt.gasUsed.toString());
      
      // Save deployment info
      const deploymentInfo = {
        contract: "AgroShieldPool",
        address: receipt.contractAddress,
        network: "celo-mainnet",
        deployedAt: new Date().toISOString(),
        deployer: account.address,
        cusdToken: CUSD_ADDRESS
      };

      require('fs').writeFileSync(
        './deployment-pool-new.json', 
        JSON.stringify(deploymentInfo, null, 2)
      );
      
      console.log("\n💾 Deployment saved to: deployment-pool-new.json");
      
      console.log("\n🔧 UPDATE YOUR SCRIPT:");
      console.log("Change POOL_ADDRESS to:", receipt.contractAddress);
      console.log("Then run: npm run spin-standard");
      
    } else {
      console.error("❌ Deployment failed - no contract address returned");
    }

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
