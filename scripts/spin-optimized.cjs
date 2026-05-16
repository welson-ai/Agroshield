const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// Contract ABIs
const AGROSHIELD_POOL_ABI = [
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
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "shares", "type": "uint256"}
    ],
    "name": "withdrawLiquidity",
    "outputs": [],
    "stateMutability": "nonpayable",
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
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
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
  }
];

// NEWLY DEPLOYED CONTRACT ADDRESSES
const POOL_ADDRESS = "0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6";
const CUSD_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;
const SPIN_AMOUNT = parseEther("0.01"); // 0.01 cUSD per spin
const SPIN_COUNT = 50;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Retry helper with exponential backoff
async function retryWithBackoff(fn, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`⚠️  Retry ${i + 1}/${retries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

async function main() {
  console.log("🚀 OPTIMIZED TRANSACTION SPINNING - 50 ITERATIONS");
  console.log("==============================================");
  
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

    // Check pool stats
    const totalLiquidity = await publicClient.readContract({
      address: POOL_ADDRESS,
      abi: AGROSHIELD_POOL_ABI,
      functionName: 'totalLiquidity'
    });
    console.log("📊 Pool Liquidity:", formatEther(totalLiquidity), "cUSD");

    // Check user's current position
    const userDeposits = await publicClient.readContract({
      address: POOL_ADDRESS,
      abi: AGROSHIELD_POOL_ABI,
      functionName: 'userDeposits',
      args: [account.address]
    });
    const userShares = await publicClient.readContract({
      address: POOL_ADDRESS,
      abi: AGROSHIELD_POOL_ABI,
      functionName: 'userShares',
      args: [account.address]
    });
    console.log("💵 Your Deposits:", formatEther(userDeposits), "cUSD");
    console.log("📊 Your Shares:", userShares.toString());

    // OPTIMIZATION: Single approval for total amount upfront
    console.log("\n🔓 Setting up single approval for all spins...");
    const totalAmountNeeded = SPIN_AMOUNT * BigInt(SPIN_COUNT);
    const currentAllowance = await publicClient.readContract({
      address: CUSD_TOKEN_ADDRESS,
      abi: CUSD_TOKEN_ABI,
      functionName: 'allowance',
      args: [account.address, POOL_ADDRESS]
    });

    if (currentAllowance < totalAmountNeeded) {
      console.log(`📤 Approving ${formatEther(totalAmountNeeded)} cUSD for pool...`);
      const approveHash = await retryWithBackoff(async () => {
        return await walletClient.writeContract({
          address: CUSD_TOKEN_ADDRESS,
          abi: CUSD_TOKEN_ABI,
          functionName: 'approve',
          args: [POOL_ADDRESS, totalAmountNeeded]
        });
      });

      const approveReceipt = await publicClient.waitForTransactionReceipt({ 
        hash: approveHash 
      });
      
      console.log(`✅ Approval confirmed - Gas: ${approveReceipt.gasUsed.toString()}`);
    } else {
      console.log("✅ Sufficient allowance already exists");
    }

    // Transaction spinning loop
    console.log(`\n🔄 Starting ${SPIN_COUNT} optimized transaction spins...`);
    console.log(`💵 Amount per spin: ${formatEther(SPIN_AMOUNT)} cUSD`);

    let successfulTransactions = 0;
    let failedTransactions = 0;
    let totalGasUsed = BigInt(0);
    let currentShares = userShares;

    for (let i = 1; i <= SPIN_COUNT; i++) {
      console.log(`\n📍 Spin ${i}/${SPIN_COUNT}`);
      console.log("=".repeat(50));

      try {
        // 1. Deposit cUSD (no approval needed now)
        console.log("💰 Depositing cUSD...");
        const depositHash = await retryWithBackoff(async () => {
          return await walletClient.writeContract({
            address: POOL_ADDRESS,
            abi: AGROSHIELD_POOL_ABI,
            functionName: 'provideLiquidity',
            args: [SPIN_AMOUNT]
          });
        });

        const depositReceipt = await publicClient.waitForTransactionReceipt({ 
          hash: depositHash 
        });
        
        console.log(`✅ Deposit confirmed - Gas: ${depositReceipt.gasUsed.toString()}`);
        totalGasUsed += depositReceipt.gasUsed;

        // 2. Withdraw cUSD (calculate shares locally to avoid extra read)
        console.log("🏧 Withdrawing cUSD...");
        
        // Calculate new shares: current + amount * (totalShares / totalLiquidity)
        // But since we're withdrawing everything we just deposited, we can use the new shares directly
        const withdrawHash = await retryWithBackoff(async () => {
          return await walletClient.writeContract({
            address: POOL_ADDRESS,
            abi: AGROSHIELD_POOL_ABI,
            functionName: 'withdrawLiquidity',
            args: [SPIN_AMOUNT] // Withdraw the exact amount we deposited
          });
        });

        const withdrawReceipt = await publicClient.waitForTransactionReceipt({ 
          hash: withdrawHash 
        });
        
        console.log(`✅ Withdraw confirmed - Gas: ${withdrawReceipt.gasUsed.toString()}`);
        totalGasUsed += withdrawReceipt.gasUsed;

        successfulTransactions++;
        console.log(`🎉 Spin ${i} completed successfully!`);

        // OPTIMIZATION: Only wait if we're getting rate limited
        // Remove fixed 2-second wait, let transactions flow naturally
        if (i < SPIN_COUNT && i % 10 === 0) {
          console.log("⏳ Brief pause after 10 spins...");
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.error(`❌ Spin ${i} failed:`, error.message);
        failedTransactions++;
        
        // If we hit consecutive failures, wait longer
        if (failedTransactions > 3) {
          console.log("⏳ Waiting 5 seconds due to consecutive failures...");
          await new Promise(resolve => setTimeout(resolve, 5000));
          failedTransactions = 0; // Reset counter
        }
      }
    }

    // Final summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 OPTIMIZED TRANSACTION SPINNING SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Successful Spins: ${successfulTransactions}/${SPIN_COUNT}`);
    console.log(`❌ Failed Spins: ${failedTransactions}/${SPIN_COUNT}`);
    console.log(`📈 Success Rate: ${((successfulTransactions / SPIN_COUNT) * 100).toFixed(1)}%`);
    console.log(`⛽ Total Gas Used: ${totalGasUsed.toString()}`);
    console.log(`⛽ Avg Gas per Spin: ${(totalGasUsed / BigInt(successfulTransactions)).toString()}`);

    // Check final balances
    const finalCeloBalance = await publicClient.getBalance({ address: account.address });
    const finalCusdBalance = await publicClient.readContract({
      address: CUSD_TOKEN_ADDRESS,
      abi: CUSD_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [account.address]
    });

    console.log(`💰 Final CELO Balance: ${formatEther(finalCeloBalance)} CELO`);
    console.log(`💵 Final cUSD Balance: ${formatEther(finalCusdBalance)} cUSD`);
    console.log(`📉 CELO Change: ${formatEther(finalCeloBalance - celoBalance)} CELO`);
    console.log(`📉 cUSD Change: ${formatEther(finalCusdBalance - cusdBalance)} cUSD`);

    if (successfulTransactions === SPIN_COUNT) {
      console.log("\n🎊 ALL TRANSACTIONS COMPLETED SUCCESSFULLY!");
    } else if (successfulTransactions > 0) {
      console.log("\n⚠️  PARTIAL SUCCESS - Some transactions failed");
    } else {
      console.log("\n❌ ALL TRANSACTIONS FAILED");
    }

  } catch (error) {
    console.error("Script failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
