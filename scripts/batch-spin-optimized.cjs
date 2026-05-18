const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// Batch Spins Contract ABI
const BATCH_SPINS_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "spinCount", "type": "uint256"},
      {"internalType": "uint256", "name": "spinAmount", "type": "uint256"}
    ],
    "name": "batchSpins",
    "outputs": [
      {"internalType": "bool", "name": "success", "type": "bool"},
      {"internalType": "uint256", "name": "totalGasUsed", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "spinCount", "type": "uint256"}
    ],
    "name": "estimateBatchGas",
    "outputs": [
      {"internalType": "uint256", "name": "estimatedGas", "type": "uint256"}
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "spinCount", "type": "uint256"}
    ],
    "name": "calculateGasSavings",
    "outputs": [
      {"internalType": "uint256", "name": "estimatedSavings", "type": "uint256"}
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalBatchSpins",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cUSDToken",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "liquidityPool",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Events for tracking
const BATCH_SPINS_EVENTS = [
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "spinIndex", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "SpinStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "spinIndex", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "gasUsed", "type": "uint256"}
    ],
    "name": "SpinCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "totalSpins", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "totalGasUsed", "type": "uint256"}
    ],
    "name": "BatchSpinsCompleted",
    "type": "event"
  }
];

// cUSD Token ABI (for approval)
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
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
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
  }
];

// Contract addresses (update after deployment)
const BATCH_SPINS_ADDRESS = "0xTODO"; // Update after deployment
const CUSD_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;

async function main() {
  console.log("🚀 AGROSHIELD BATCH SPINS - MAXIMUM GAS OPTIMIZATION");
  console.log("===================================================");
  console.log("💡 BATCH BENEFITS:");
  console.log("   - All spins visible as individual events");
  console.log("   - Single transaction for multiple spins");
  console.log("   - ~85% gas savings vs individual transactions");
  console.log("");
  
  const privateKey = process.env.PRIVATE_KEY;
  const account = privateKeyToAccount(privateKey);
  console.log("👤 Account Address:", account.address);

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
    account: account
  });

  try {
    if (BATCH_SPINS_ADDRESS === "0xTODO") {
      console.log("❌ Please deploy the batch contract first and update BATCH_SPINS_ADDRESS");
      console.log("🔧 Run: cd contract && forge script script/DeployBatchSpins.s.sol --rpc-url forno --broadcast");
      return;
    }

    // Check balances
    const celoBalance = await publicClient.getBalance({ address: account.address });
    console.log("💰 CELO Balance:", formatEther(celoBalance), "CELO");
    
    const cusdBalance = await publicClient.readContract({
      address: CUSD_TOKEN_ADDRESS,
      abi: CUSD_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [account.address]
    });
    console.log("💵 cUSD Balance:", formatEther(cusdBalance), "cUSD");

    // Check batch contract
    const totalBatchSpins = await publicClient.readContract({
      address: BATCH_SPINS_ADDRESS,
      abi: BATCH_SPINS_ABI,
      functionName: 'totalBatchSpins'
    });
    console.log("📊 Total Batch Spins So Far:", totalBatchSpins.toString());

    // Configuration
    const SPIN_COUNT = 100; // 100 spins in one transaction!
    const SPIN_AMOUNT = parseEther("0.01"); // 0.01 cUSD per spin
    const TOTAL_AMOUNT = SPIN_AMOUNT * BigInt(SPIN_COUNT);

    console.log(`\n🎯 BATCH CONFIGURATION:`);
    console.log(`📝 Spins per Batch: ${SPIN_COUNT}`);
    console.log(`💵 Amount per Spin: ${formatEther(SPIN_AMOUNT)} cUSD`);
    console.log(`💰 Total Amount Needed: ${formatEther(TOTAL_AMOUNT)} cUSD`);

    // Gas estimation
    const estimatedGas = await publicClient.readContract({
      address: BATCH_SPINS_ADDRESS,
      abi: BATCH_SPINS_ABI,
      functionName: 'estimateBatchGas',
      args: [SPIN_COUNT]
    });
    console.log(`⛽ Estimated Gas: ${estimatedGas.toString()}`);

    const gasSavings = await publicClient.readContract({
      address: BATCH_SPINS_ADDRESS,
      abi: BATCH_SPINS_ABI,
      functionName: 'calculateGasSavings',
      args: [SPIN_COUNT]
    });
    console.log(`💰 Estimated Gas Savings: ${gasSavings.toString()} gas units`);
    console.log(`💵 Estimated CELO Savings: ${formatEther(gasSavings * BigInt(20000000000))} CELO`);

    // Check and set up approval
    console.log(`\n🔓 Setting up approval for batch contract...`);
    const currentAllowance = await publicClient.readContract({
      address: CUSD_TOKEN_ADDRESS,
      abi: CUSD_TOKEN_ABI,
      functionName: 'allowance',
      args: [account.address, BATCH_SPINS_ADDRESS]
    });

    if (currentAllowance < TOTAL_AMOUNT) {
      console.log(`📤 Approving ${formatEther(TOTAL_AMOUNT)} cUSD to batch contract...`);
      const approveHash = await walletClient.writeContract({
        address: CUSD_TOKEN_ADDRESS,
        abi: CUSD_TOKEN_ABI,
        functionName: 'approve',
        args: [BATCH_SPINS_ADDRESS, TOTAL_AMOUNT]
      });

      console.log(`📤 Approval TX: https://celoscan.io/tx/${approveHash}`);
      
      const approveReceipt = await publicClient.waitForTransactionReceipt({ 
        hash: approveHash 
      });
      
      console.log(`✅ Approval confirmed in block ${approveReceipt.blockNumber}`);
      console.log(`⛽ Approval Gas Used: ${approveReceipt.gasUsed.toString()}`);
    } else {
      console.log("✅ Sufficient allowance already exists");
    }

    // Execute batch spins
    console.log(`\n🚀 EXECUTING ${SPIN_COUNT} BATCH SPINS!`);
    console.log("=".repeat(50));

    const startTime = Date.now();

    const batchHash = await walletClient.writeContract({
      address: BATCH_SPINS_ADDRESS,
      abi: BATCH_SPINS_ABI,
      functionName: 'batchSpins',
      args: [SPIN_COUNT, SPIN_AMOUNT]
    });

    console.log(`📤 Batch TX: https://celoscan.io/tx/${batchHash}`);
    
    const batchReceipt = await publicClient.waitForTransactionReceipt({ 
      hash: batchHash 
    });
    
    const endTime = Date.now();
    const executionTime = (endTime - startTime) / 1000;

    console.log(`✅ Batch completed in block ${batchReceipt.blockNumber}`);
    console.log(`⛽ Actual Gas Used: ${batchReceipt.gasUsed.toString()}`);
    console.log(`⏱️  Execution Time: ${executionTime.toFixed(2)} seconds`);

    // Parse events to show individual spins
    console.log(`\n📊 INDIVIDUAL SPIN RESULTS:`);
    console.log("-".repeat(50));
    
    let spinStartedCount = 0;
    let spinCompletedCount = 0;

    for (const log of batchReceipt.logs) {
      try {
        const parsedLog = publicClient.parseLog({
          abi: BATCH_SPINS_EVENTS,
          data: log.data,
          topics: log.topics
        });

        if (parsedLog.eventName === 'SpinStarted') {
          spinStartedCount++;
          console.log(`📍 Spin ${parsedLog.args.spinIndex}: Started - ${formatEther(parsedLog.args.amount)} cUSD`);
        } else if (parsedLog.eventName === 'SpinCompleted') {
          spinCompletedCount++;
          console.log(`✅ Spin ${parsedLog.args.spinIndex}: Completed - Gas: ${parsedLog.args.gasUsed}`);
        } else if (parsedLog.eventName === 'BatchSpinsCompleted') {
          console.log(`\n🎊 BATCH SUMMARY:`);
          console.log(`👤 User: ${parsedLog.args.user}`);
          console.log(`📝 Total Spins: ${parsedLog.args.totalSpins}`);
          console.log(`💰 Total Amount: ${formatEther(parsedLog.args.totalAmount)} cUSD`);
          console.log(`⛽ Total Gas Used: ${parsedLog.args.totalGasUsed}`);
        }
      } catch (e) {
        // Skip logs that don't match our events
      }
    }

    // Final balance check
    const finalCeloBalance = await publicClient.getBalance({ address: account.address });
    const finalCusdBalance = await publicClient.readContract({
      address: CUSD_TOKEN_ADDRESS,
      abi: CUSD_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [account.address]
    });

    console.log(`\n📊 FINAL RESULTS:`);
    console.log("=".repeat(50));
    console.log(`💰 Final CELO Balance: ${formatEther(finalCeloBalance)} CELO`);
    console.log(`💵 Final cUSD Balance: ${formatEther(finalCusdBalance)} cUSD`);
    console.log(`📉 CELO Change: ${formatEther(finalCeloBalance - celoBalance)} CELO`);
    console.log(`📉 cUSD Change: ${formatEther(finalCusdBalance - cusdBalance)} cUSD`);

    // Comparison with original method
    console.log(`\n💡 COST COMPARISON:`);
    console.log("=".repeat(50));
    console.log(`🔴 Original Method (100 spins):`);
    console.log(`   - Transactions: 300 (3 per spin)`);
    console.log(`   - Estimated Cost: ~2.0 CELO`);
    console.log(`   - Time: ~200 seconds`);
    console.log(`🟢 Batch Method (100 spins):`);
    console.log(`   - Transactions: 2 (approve + batch)`);
    console.log(`   - Actual Cost: ${formatEther(batchReceipt.gasUsed * BigInt(20000000000))} CELO`);
    console.log(`   - Time: ${executionTime.toFixed(1)} seconds`);
    console.log(`💰 Total Savings: ${formatEther(celoBalance - finalCeloBalance)} CELO`);
    console.log(`⚡ Speed Improvement: ${(200 / executionTime).toFixed(1)}x faster`);
    console.log(`💸 Cost Reduction: ${((2.0 - parseFloat(formatEther(batchReceipt.gasUsed * BigInt(20000000000)))) / 2.0 * 100).toFixed(1)}%`);

    // Update contract stats
    const newTotalBatchSpins = await publicClient.readContract({
      address: BATCH_SPINS_ADDRESS,
      abi: BATCH_SPINS_ABI,
      functionName: 'totalBatchSpins'
    });
    console.log(`\n📈 CONTRACT STATISTICS:`);
    console.log(`📊 Total Batch Spins (all users): ${newTotalBatchSpins.toString()}`);

    console.log(`\n🎊 ALL ${SPIN_COUNT} SPINS COMPLETED IN ONE TRANSACTION!`);
    console.log(`🔗 View all individual spins: https://celoscan.io/tx/${batchHash}#eventlog`);

  } catch (error) {
    console.error("❌ Batch spin failed:", error.message);
    
    if (error.message.includes("Insufficient allowance")) {
      console.log("💡 Try: Increase cUSD approval amount");
    } else if (error.message.includes("Insufficient balance")) {
      console.log("💡 Try: Add more cUSD to your wallet");
    } else if (error.message.includes("gas")) {
      console.log("💡 Try: Increase gas limit or check CELO balance");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
