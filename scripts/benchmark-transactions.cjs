const { createWalletClient, createPublicClient, http, formatEther, parseEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { celo } = require("viem/chains");
require('dotenv').config();

const POOL_ADDRESS = "0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6";
const CUSD_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const RPC_URL = "https://forno.celo.org";

// Performance benchmark configuration
const BENCHMARK_CONFIG = {
  concurrentUsers: [1, 5, 10, 20],
  transactionsPerUser: [10, 25, 50],
  amounts: [
    parseEther("0.01"),
    parseEther("0.1"),
    parseEther("1.0")
  ]
};

// Contract ABI
const POOL_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "provideLiquidity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "shares", "type": "uint256"}
    ],
    "name": "withdrawLiquidity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function runBenchmark() {
  console.log("🚀 AGROSHIELD PERFORMANCE BENCHMARK");
  console.log("===================================");
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY not found in .env file");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey.startsWith("0x") ? privateKey : "0x" + privateKey);
  
  const publicClient = createPublicClient({
    chain: celo,
    transport: http(RPC_URL)
  });

  const walletClient = createWalletClient({
    chain: celo,
    transport: http(RPC_URL),
    account
  });

  console.log(`👤 Benchmark account: ${account.address}`);
  console.log(`🔗 Contract: ${POOL_ADDRESS}`);

  try {
    // Get initial state
    const initialLiquidity = await publicClient.readContract({
      address: POOL_ADDRESS,
      abi: POOL_ABI,
      functionName: 'totalLiquidity'
    });

    console.log(`💰 Initial liquidity: ${formatEther(initialLiquidity)} cUSD`);

    // Run benchmark scenarios
    const results = [];

    for (const userCount of BENCHMARK_CONFIG.concurrentUsers) {
      for (const txCount of BENCHMARK_CONFIG.transactionsPerUser) {
        for (const amount of BENCHMARK_CONFIG.amounts) {
          console.log(`\n📊 Benchmark: ${userCount} users, ${txCount} tx/user, ${formatEther(amount)} cUSD`);
          
          const result = await runBenchmarkScenario(
            walletClient,
            publicClient,
            userCount,
            txCount,
            amount
          );
          
          results.push(result);
          
          // Wait between scenarios
          console.log("⏳ Waiting 5 seconds before next scenario...");
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    // Generate report
    generateBenchmarkReport(results);

  } catch (error) {
    console.error("❌ Benchmark failed:", error.message);
    process.exit(1);
  }
}

async function runBenchmarkScenario(walletClient, publicClient, userCount, txCount, amount) {
  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;
  let totalGasUsed = BigInt(0);
  let errors = [];

  console.log(`🔄 Running ${userCount} concurrent users...`);

  // Simulate concurrent operations
  const promises = [];
  
  for (let i = 0; i < userCount; i++) {
    const userWallet = walletClient; // In real scenario, would use different accounts
    
    for (let j = 0; j < txCount; j++) {
      const promise = executeTransaction(userWallet, publicClient, amount, i, j);
      promises.push(promise);
    }
  }

  // Wait for all transactions to complete
  try {
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
        totalGasUsed += result.value.gasUsed;
      } else {
        failCount++;
        errors.push(result.reason);
      }
    });
    
  } catch (error) {
    console.error(`❌ Scenario failed: ${error.message}`);
    return {
      userCount,
      txCount,
      amount,
      successCount,
      failCount,
      totalGasUsed,
      errors,
      duration: Date.now() - startTime,
      successRate: (successCount / (userCount * txCount)) * 100
    };
  }
}

async function executeTransaction(walletClient, publicClient, amount, userIndex, txIndex) {
  try {
    // Estimate gas first
    const gasEstimate = await publicClient.estimateContractGas({
      address: POOL_ADDRESS,
      abi: POOL_ABI,
      functionName: 'provideLiquidity',
      args: [amount]
    });

    // Execute transaction
    const txHash = await walletClient.writeContract({
      address: POOL_ADDRESS,
      abi: POOL_ABI,
      functionName: 'provideLiquidity',
      args: [amount],
      gas: gasEstimate
    });

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    
    return {
      success: true,
      txHash,
      gasUsed: receipt.gasUsed,
      blockNumber: receipt.blockNumber,
      userIndex,
      txIndex
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      userIndex,
      txIndex
    };
  }
}

function generateBenchmarkReport(results) {
  console.log("\n" + "=".repeat(50));
  console.log("📊 BENCHMARK RESULTS SUMMARY");
  console.log("=".repeat(50));

  // Performance metrics
  const avgGasPerTx = results.reduce((sum, r) => sum + Number(r.totalGasUsed), 0) / 
    results.reduce((sum, r) => sum + (r.userCount * r.txCount), 0);
  
  const avgSuccessRate = results.reduce((sum, r) => sum + r.successRate, 0) / results.length;
  
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

  console.log(`\n📈 PERFORMANCE METRICS:`);
  console.log(`⛽ Average gas per transaction: ${Math.round(avgGasPerTx)}`);
  console.log(`✅ Average success rate: ${avgSuccessRate.toFixed(1)}%`);
  console.log(`⏱️ Average duration: ${Math.round(avgDuration)}ms`);

  // Find best performing scenario
  const bestScenario = results.reduce((best, current) => 
    current.successRate > best.successRate ? current : best
  );

  console.log(`\n🏆 BEST PERFORMING SCENARIO:`);
  console.log(`👥 Users: ${bestScenario.userCount}`);
  console.log(`🔄 Transactions: ${bestScenario.txCount}`);
  console.log(`💰 Amount: ${formatEther(bestScenario.amount)} cUSD`);
  console.log(`✅ Success rate: ${bestScenario.successRate.toFixed(1)}%`);
  console.log(`⛽ Gas per tx: ${Math.round(Number(bestScenario.totalGasUsed) / (bestScenario.userCount * bestScenario.txCount))}`);

  // Recommendations
  console.log(`\n💡 RECOMMENDATIONS:`);
  
  if (avgSuccessRate < 90) {
    console.log(`⚠️ Low success rate (${avgSuccessRate.toFixed(1)}%) - Consider reducing concurrent users`);
  }
  
  if (avgGasPerTx > 100000) {
    console.log(`⚠️ High gas usage (${Math.round(avgGasPerTx)}) - Consider contract optimization`);
  }
  
  if (bestScenario.userCount === 1 && bestScenario.successRate > 95) {
    console.log(`✅ Single user scenario performs best - Recommend for production`);
  }

  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      avgGasPerTx: Math.round(avgGasPerTx),
      avgSuccessRate: avgSuccessRate.toFixed(1),
      avgDuration: Math.round(avgDuration),
      bestScenario
    }
  };

  require('fs').writeFileSync(
    `benchmark-report-${Date.now()}.json`,
    JSON.stringify(reportData, null, 2)
  );

  console.log(`\n📄 Detailed report saved to: benchmark-report-${Date.now()}.json`);
}

// Main execution
if (require.main === module) {
  runBenchmark()
    .then(() => {
      console.log(`\n🎯 BENCHMARK COMPLETE`);
      process.exit(0);
    })
    .catch(error => {
      console.error("Benchmark failed:", error);
      process.exit(1);
    });
}

module.exports = { runBenchmark, generateBenchmarkReport };
