const { createPublicClient, http, formatEther, parseEther } = require("viem");
const { celo } = require("viem/chains");
require('dotenv').config();

const POOL_ADDRESS = "0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6";
const CUSD_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const RPC_URL = "https://forno.celo.org";

// Contract ABI for monitoring
const POOL_ABI = [
  {
    "inputs": [],
    "name": "totalLiquidity",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "userDeposits",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "userShares",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const CUSD_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function monitorContract() {
  console.log("🔍 MONITORING AGROSHIELD CONTRACT");
  console.log("===================================");
  
  const publicClient = createPublicClient({
    chain: celo,
    transport: http(RPC_URL)
  });

  try {
    // Get current block
    const latestBlock = await publicClient.getBlockNumber();
    console.log(`📦 Current block: ${latestBlock}`);

    // Monitor contract state
    const totalLiquidity = await publicClient.readContract({
      address: POOL_ADDRESS,
      abi: POOL_ABI,
      functionName: 'totalLiquidity'
    });

    console.log(`💰 Total liquidity: ${formatEther(totalLiquidity)} cUSD`);

    // Monitor recent transactions
    const currentBlock = await publicClient.getBlock({ blockNumber: latestBlock });
    let recentTransactions = [];
    
    if (currentBlock && currentBlock.transactions) {
      for (const tx of currentBlock.transactions) {
        const fullTx = await publicClient.getTransaction({ hash: tx });
        if (fullTx && fullTx.to === POOL_ADDRESS) {
          recentTransactions.push({
            hash: tx,
            gasUsed: fullTx.gas ? fullTx.gas.toString() : 'N/A',
            gasPrice: fullTx.gasPrice ? fullTx.gasPrice.toString() : 'N/A',
            blockNumber: fullTx.blockNumber ? fullTx.blockNumber.toString() : 'N/A'
          });
        }
      }
    }

    console.log(`📊 Recent transactions: ${recentTransactions.length}`);

    // Display transaction details
    recentTransactions.forEach((tx, index) => {
      console.log(`\n🔗 Transaction ${index + 1}:`);
      console.log(`   Hash: ${tx.hash}`);
      console.log(`   Gas used: ${tx.gasUsed}`);
      console.log(`   Gas price: ${tx.gasPrice} gwei`);
      console.log(`   Block: ${tx.blockNumber}`);
      console.log(`   Explorer: https://celoscan.io/tx/${tx.hash}`);
    });

    // Check token balance
    const contractBalance = await publicClient.readContract({
      address: CUSD_TOKEN_ADDRESS,
      abi: CUSD_ABI,
      functionName: 'balanceOf',
      args: [POOL_ADDRESS]
    });

    console.log(`💵 Contract cUSD balance: ${formatEther(contractBalance)}`);

    // Health check
    const health = await checkContractHealth(publicClient);
    console.log(`\n🏥 Contract Health: ${health.status}`);
    console.log(`📊 Health score: ${health.score}/100`);
    
    if (health.issues.length > 0) {
      console.log(`⚠️ Issues detected:`);
      health.issues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
    }

    return {
      blockNumber: latestBlock,
      totalLiquidity: formatEther(totalLiquidity),
      recentTransactions: recentTransactions.length,
      contractBalance: formatEther(contractBalance),
      health
    };

  } catch (error) {
    console.error("❌ Monitoring failed:", error.message);
    return null;
  }
}

async function checkContractHealth(publicClient) {
  try {
    const totalLiquidity = await publicClient.readContract({
      address: POOL_ADDRESS,
      abi: POOL_ABI,
      functionName: 'totalLiquidity'
    });

    const issues = [];
    let score = 100;

    // Check if contract has liquidity
    if (totalLiquidity === 0n) {
      issues.push("No liquidity in pool");
      score -= 30;
    }

    // Check if contract is responsive
    try {
      await publicClient.readContract({
        address: POOL_ADDRESS,
        abi: POOL_ABI,
        functionName: 'totalLiquidity'
      });
    } catch (error) {
      issues.push("Contract not responding");
      score -= 50;
    }

    return {
      status: score >= 80 ? "Healthy" : score >= 60 ? "Warning" : "Critical",
      score,
      issues
    };

  } catch (error) {
    return {
      status: "Error",
      score: 0,
      issues: [error.message]
    };
  }
}

// Continuous monitoring
async function startContinuousMonitoring() {
  console.log("🔄 STARTING CONTINUOUS MONITORING");
  console.log("Press Ctrl+C to stop");
  
  const publicClient = createPublicClient({
    chain: celo,
    transport: http(RPC_URL)
  });

  let lastKnownBlock = 0;
  
  const monitor = async () => {
    try {
      const currentBlock = await publicClient.getBlockNumber();
      
      if (currentBlock > lastKnownBlock) {
        console.log(`\n📦 New block: ${currentBlock}`);
        
        const result = await monitorContract();
        lastKnownBlock = currentBlock;
        
        // Wait 10 seconds before next check
        setTimeout(monitor, 10000);
      }
    } catch (error) {
      console.error("❌ Monitoring error:", error.message);
      setTimeout(monitor, 30000); // Wait longer on error
    }
  };

  // Start monitoring
  monitor();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log("\n🛑 Stopping monitoring...");
    process.exit(0);
  });
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--continuous')) {
    startContinuousMonitoring();
  } else {
    monitorContract()
      .then(result => {
        if (result) {
          console.log(`\n🎯 MONITORING COMPLETE`);
        } else {
          console.log(`\n❌ MONITORING FAILED`);
        }
        process.exit(0);
      })
      .catch(error => {
        console.error("Script failed:", error);
        process.exit(1);
      });
  }
}

module.exports = { monitorContract, checkContractHealth, startContinuousMonitoring };
