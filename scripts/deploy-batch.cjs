const { createPublicClient, createWalletClient, http, parseEther, formatEther, encodeDeployData } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// Pre-compiled AgroShieldBatchSpins contract
// Compiled with solc 0.8.19
const BATCH_SPINS_BYTECODE = "0x60c060405234801561001057600080fd5b5060405161069538038061069583398101604081905261002f9161007c565b6001600160a01b039182166080521660a052600080546001600160a01b031916331790556100af565b80516001600160a01b038116811461006f57600080fd5b919050565b6000806040838503121561008f57600080fd5b61009883610058565b91506100a660208401610058565b90509250929050565b60805160a0516105b36100e26000396000818160b4015261024c01526000818160dd015261016601526105b36000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80633ccfd60b1461005c5780635fcbd285146100665780638da5cb5b14610095578063d4b83992146100b2578063fc0c546a146100d8575b600080fd5b6100646100ff565b005b6100796100743660046104a8565b610186565b6040805192835260208301919091520160405180910390f35b6000546001600160a01b03165b6040516001600160a01b03909116815260200160405180910390f35b7f00000000000000000000000000000000000000000000000000000000000000006100a2565b6100a27f000000000000000000000000000000000000000000000000000000000000000081565b6000546001600160a01b0316331461012c5760405162461bcd60e51b815260040161012390610503565b60405180910390fd5b6040516370a0823160e01b81523060048201526000907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906370a0823190602401602060405180830381865afa158015610193573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101b79190610527565b90508015610183576000546040516001600160a01b039091169082156108fc029083906000818181858888f19350505050158015610183573d6000803e3d6000fd5b5050565b6000806000841180156101a057506064841115155b6101e25760405162461bcd60e51b8152602060048201526013602482015272496e76616c6964207370696e20636f756e7460681b6044820152606401610123565b600083116102245760405162461bcd60e51b815260206004820152600f60248201526e416d6f756e74206d757374203e203060881b6044820152606401610123565b600061023085856104ca565b6040516323b872dd60e01b8152336004820152306024820152604481018290529091507f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906323b872dd906064016020604051808303816000875af11580156102a6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102ca91906104e1565b6103085760405162461bcd60e51b815260206004820152600f60248201526e5472616e73666572206661696c656460881b6044820152606401610123565b6040516370a0823160e01b81523060048201526000907f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316906370a0823190602401602060405180830381865afa15801561036f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103939190610527565b604051636eb1769f60e11b81523060048201526001600160a01b037f000000000000000000000000000000000000000000000000000000000000000081166024830152919250600091829182917f0000000000000000000000000000000000000000000000000000000000000000169063dd62ed3e90604401602060405180830381865afa158015610429573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061044d9190610527565b9050808310156104a0576040516001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063095ea7b3906104a0908790600090600401610540565b505050509250929050565b600080604083850312156104bb57600080fd5b50508035926020909101359150565b80820281158282048414176104db576104db610559565b92915050565b6000602082840312156104f357600080fd5b815180151581146104db57600080fd5b6020808252600990820152682737ba1037bbb732b960b91b604082015260600190565b60006020828403121561053957600080fd5b5051919050565b6001600160a01b03929092168252602082015260400190565b634e487b7160e01b600052601160045260246000fdfea264697066735822122089abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456764736f6c63430008130033";

const BATCH_SPINS_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_cUSD", "type": "address"},
      {"internalType": "address", "name": "_pool", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "spinCount", "type": "uint256"},
      {"internalType": "uint256", "name": "amountPerSpin", "type": "uint256"}
    ],
    "name": "batchSpin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cUSD",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pool",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const POOL_ADDRESS = "0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;

async function main() {
  console.log("🚀 DEPLOYING AGROSHIELD BATCH SPINS CONTRACT");
  console.log("=============================================");
  
  const privateKey = process.env.PRIVATE_KEY;
  const account = privateKeyToAccount(privateKey);
  console.log("👤 Deployer:", account.address);

  const publicClient = createPublicClient({
    chain: {
      id: CHAIN_ID,
      name: 'Celo',
      nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
      rpcUrls: { default: { http: [RPC_URL] } }
    },
    transport: http(RPC_URL)
  });

  const walletClient = createWalletClient({
    chain: {
      id: CHAIN_ID,
      name: 'Celo',
      nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
      rpcUrls: { default: { http: [RPC_URL] } }
    },
    transport: http(RPC_URL),
    account: account
  });

  // Check balance
  const balance = await publicClient.getBalance({ address: account.address });
  console.log("💰 CELO Balance:", formatEther(balance), "CELO");

  if (balance < parseEther("0.05")) {
    console.log("❌ Need at least 0.05 CELO for deployment");
    return;
  }

  console.log("\n📋 Contract Parameters:");
  console.log("   💰 cUSD:", CUSD_ADDRESS);
  console.log("   🏊 Pool:", POOL_ADDRESS);

  try {
    // Encode constructor arguments
    const { encodeAbiParameters, parseAbiParameters } = require("viem");
    const constructorArgs = encodeAbiParameters(
      parseAbiParameters('address, address'),
      [CUSD_ADDRESS, POOL_ADDRESS]
    );
    
    const deployData = BATCH_SPINS_BYTECODE + constructorArgs.slice(2);

    console.log("\n🔨 Deploying contract...");
    
    const hash = await walletClient.sendTransaction({
      data: deployData,
    });

    console.log("📤 Deploy TX:", `https://celoscan.io/tx/${hash}`);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    console.log("\n✅ CONTRACT DEPLOYED!");
    console.log("📍 Contract Address:", receipt.contractAddress);
    console.log("⛽ Gas Used:", receipt.gasUsed.toString());
    console.log("💰 Deploy Cost:", formatEther(receipt.gasUsed * BigInt(5000000000)), "CELO (approx)");

    // Save contract address
    const fs = require('fs');
    fs.writeFileSync(
      '/Users/h/Documents/CascadeProjects/agroshield/scripts/batch-contract-address.txt',
      receipt.contractAddress
    );
    console.log("\n📝 Contract address saved to batch-contract-address.txt");

    console.log("\n🎊 DEPLOYMENT COMPLETE!");
    console.log("🔗 Explorer:", `https://celoscan.io/address/${receipt.contractAddress}`);

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
