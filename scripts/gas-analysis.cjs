const { createPublicClient, http, formatEther, parseEther } = require("viem");
const { celo } = require("viem/chains");
require('dotenv').config();

const POOL_ADDRESS = "0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6";
const CUSD_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const RPC_URL = "https://forno.celo.org";

async function analyzeGasUsage() {
  console.log("🔍 ANALYZING GAS USAGE PATTERNS");
  console.log("=====================================");
  
  const publicClient = createPublicClient({
    chain: celo,
    transport: http(RPC_URL)
  });

  try {
    // Get recent blocks for analysis
    const latestBlock = await publicClient.getBlockNumber();
    const blocks = await Promise.all([
      publicClient.getBlock({ blockNumber: latestBlock - 10 }),
      publicClient.getBlock({ blockNumber: latestBlock - 20 }),
      publicClient.getBlock({ blockNumber: latestBlock - 30 }),
      publicClient.getBlock({ blockNumber: latestBlock - 40 }),
      publicClient.getBlock({ blockNumber: latestBlock - 50 })
    ]);

    // Analyze gas usage in recent blocks
    let totalGasUsed = BigInt(0);
    let transactionCount = 0;
    let gasPrices = [];

    for (const block of blocks) {
      if (block && block.transactions) {
        for (const tx of block.transactions) {
          const fullTx = await publicClient.getTransaction({ hash: tx });
          if (fullTx && fullTx.to === POOL_ADDRESS) {
            totalGasUsed += fullTx.gas;
            transactionCount++;
            
            if (fullTx.gasPrice) {
              gasPrices.push(Number(fullTx.gasPrice));
            }
          }
        }
      }
    }

    // Calculate statistics
    const avgGasUsed = transactionCount > 0 ? Number(totalGasUsed / BigInt(transactionCount)) : 0;
    const avgGasPrice = gasPrices.length > 0 ? gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length : 0;
    const maxGasPrice = gasPrices.length > 0 ? Math.max(...gasPrices) : 0;
    const minGasPrice = gasPrices.length > 0 ? Math.min(...gasPrices) : 0;

    console.log(`📊 ANALYSIS RESULTS:`);
    console.log(`🔗 Transactions analyzed: ${transactionCount}`);
    console.log(`⛽ Total gas used: ${totalGasUsed.toString()}`);
    console.log(`📈 Average gas per tx: ${avgGasUsed}`);
    console.log(`💰 Average gas price: ${avgGasPrice} gwei`);
    console.log(`📊 Max gas price: ${maxGasPrice} gwei`);
    console.log(`📉 Min gas price: ${minGasPrice} gwei`);

    // Get pool statistics
    const poolStats = await publicClient.readContract({
      address: POOL_ADDRESS,
      abi: [
        {
          "inputs": [],
          "name": "totalLiquidity",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ],
      functionName: 'totalLiquidity'
    });

    console.log(`💰 Pool liquidity: ${formatEther(poolStats)} cUSD`);

    // Gas efficiency analysis
    const efficiencyScore = calculateGasEfficiency(avgGasUsed, avgGasPrice);
    console.log(`⚡ Gas efficiency score: ${efficiencyScore}/100`);

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    if (avgGasUsed > 100000) {
      console.log(`⚠️ High gas usage detected (${avgGasUsed})`);
      console.log(`💡 Consider optimizing contract logic`);
    }
    
    if (avgGasPrice > 50) {
      console.log(`⚠️ High gas prices detected (${avgGasPrice} gwei)`);
      console.log(`💡 Consider waiting for lower gas prices`);
    }

    if (efficiencyScore < 70) {
      console.log(`⚠️ Low gas efficiency (${efficiencyScore}/100)`);
      console.log(`💡 Review contract optimization`);
    } else {
      console.log(`✅ Good gas efficiency (${efficiencyScore}/100)`);
    }

    return {
      transactionCount,
      avgGasUsed,
      avgGasPrice,
      totalGasUsed,
      efficiencyScore
    };

  } catch (error) {
    console.error("❌ Analysis failed:", error.message);
    return null;
  }
}

function calculateGasEfficiency(avgGasUsed, avgGasPrice) {
  // Base efficiency score (lower gas = better)
  const gasScore = Math.max(0, 100 - (avgGasUsed / 1000));
  
  // Price efficiency (lower price = better)
  const priceScore = Math.max(0, 100 - (avgGasPrice / 2));
  
  // Combined score
  return Math.round((gasScore + priceScore) / 2);
}

// Main execution
if (require.main === module) {
  analyzeGasUsage()
    .then(results => {
      if (results) {
        console.log(`\n🎯 ANALYSIS COMPLETE`);
        process.exit(0);
      } else {
        console.log(`\n❌ ANALYSIS FAILED`);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

module.exports = { analyzeGasUsage, calculateGasEfficiency };
