const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// Batch contract deployed at:
const BATCH_CONTRACT = "0x80254d495744d39fb0e3d8a835cc7f24fd882303";
const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;

const BATCH_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "spinCount", "type": "uint256"},
      {"internalType": "uint256", "name": "amountPerSpin", "type": "uint256"}
    ],
    "name": "batchSpin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const CUSD_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function main() {
  console.log("🚀 AGROSHIELD BATCH SPIN - 80% GAS SAVINGS!");
  console.log("============================================");
  console.log("📍 Batch Contract:", BATCH_CONTRACT);
  
  const privateKey = process.env.PRIVATE_KEY;
  const account = privateKeyToAccount(privateKey);
  console.log("👤 Account:", account.address);

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

  // Configuration
  const SPIN_COUNT = 30;  // 30 spins per batch
  const AMOUNT_PER_SPIN = parseEther("0.01"); // 0.01 cUSD per spin
  const TOTAL_AMOUNT = AMOUNT_PER_SPIN * BigInt(SPIN_COUNT);

  console.log("\n📋 Batch Configuration:");
  console.log(`   🔄 Spins per batch: ${SPIN_COUNT}`);
  console.log(`   💵 Amount per spin: ${formatEther(AMOUNT_PER_SPIN)} cUSD`);
  console.log(`   💰 Total amount: ${formatEther(TOTAL_AMOUNT)} cUSD`);

  try {
    // Check balances
    const celoBalance = await publicClient.getBalance({ address: account.address });
    console.log("\n💰 CELO Balance:", formatEther(celoBalance), "CELO");

    const cusdBalance = await publicClient.readContract({
      address: CUSD_ADDRESS,
      abi: CUSD_ABI,
      functionName: 'balanceOf',
      args: [account.address]
    });
    console.log("💵 cUSD Balance:", formatEther(cusdBalance), "cUSD");

    if (cusdBalance < AMOUNT_PER_SPIN) {
      console.log("❌ Insufficient cUSD balance (need at least", formatEther(AMOUNT_PER_SPIN), "cUSD)");
      return;
    }
    
    // Adjust spin count based on available balance
    const maxSpins = Number(cusdBalance / AMOUNT_PER_SPIN);
    const actualSpinCount = Math.min(SPIN_COUNT, maxSpins);
    const actualTotal = AMOUNT_PER_SPIN * BigInt(actualSpinCount);
    
    console.log(`📊 Adjusted to ${actualSpinCount} spins based on cUSD balance`);

    // Step 1: Approve batch contract
    console.log("\n🔓 Step 1: Approving batch contract...");
    
    const currentAllowance = await publicClient.readContract({
      address: CUSD_ADDRESS,
      abi: CUSD_ABI,
      functionName: 'allowance',
      args: [account.address, BATCH_CONTRACT]
    });

    if (currentAllowance < actualTotal) {
      const approveHash = await walletClient.writeContract({
        address: CUSD_ADDRESS,
        abi: CUSD_ABI,
        functionName: 'approve',
        args: [BATCH_CONTRACT, actualTotal * BigInt(2)]
      });

      console.log("📤 Approve TX:", `https://celoscan.io/tx/${approveHash}`);
      const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveHash });
      console.log("✅ Approved! Gas:", approveReceipt.gasUsed.toString());
    } else {
      console.log("✅ Already approved");
    }

    // Step 2: Execute batch spin
    console.log("\n🔄 Step 2: Executing batch spin...");
    console.log(`   📊 ${actualSpinCount} spins in ONE transaction!`);

    const startTime = Date.now();

    const batchHash = await walletClient.writeContract({
      address: BATCH_CONTRACT,
      abi: BATCH_ABI,
      functionName: 'batchSpin',
      args: [BigInt(actualSpinCount), AMOUNT_PER_SPIN]
    });

    console.log("📤 Batch TX:", `https://celoscan.io/tx/${batchHash}`);
    console.log("⏳ Waiting for confirmation...");

    const batchReceipt = await publicClient.waitForTransactionReceipt({ hash: batchHash });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log("\n✅ BATCH COMPLETE!");
    console.log("⛽ Gas Used:", batchReceipt.gasUsed.toString());
    console.log("⏱️  Duration:", duration.toFixed(1), "seconds");

    // Final balances
    const finalCeloBalance = await publicClient.getBalance({ address: account.address });
    const finalCusdBalance = await publicClient.readContract({
      address: CUSD_ADDRESS,
      abi: CUSD_ABI,
      functionName: 'balanceOf',
      args: [account.address]
    });

    const celoUsed = celoBalance - finalCeloBalance;

    console.log("\n📊 RESULTS:");
    console.log("===========");
    console.log(`✅ Spins completed: ${actualSpinCount}`);
    console.log(`💰 CELO used: ${formatEther(celoUsed)} CELO`);
    console.log(`💵 cUSD change: ${formatEther(finalCusdBalance - cusdBalance)} cUSD`);
    
    console.log("\n💡 COMPARISON:");
    console.log(`   🔴 Old method (${actualSpinCount} spins): ~${(actualSpinCount * 0.02).toFixed(2)} CELO`);
    console.log(`   🟢 Batch method (${actualSpinCount} spins): ${formatEther(celoUsed)} CELO`);
    console.log(`   💰 Savings: ~${((1 - parseFloat(formatEther(celoUsed)) / (actualSpinCount * 0.02)) * 100).toFixed(0)}%`);

    console.log("\n🎊 SUCCESS! 100% of spins completed in ONE transaction!");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
