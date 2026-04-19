const { ethers } = require("hardhat");
const { createPublicClient, createWalletClient, http, parseEther, formatEther, Hex } = require("viem");
const { celo } = require("viem/chains");

// Contract ABI (minimal for the functions we need)
const AGROSHIELD_POOL_ABI = [
  {
    "inputs": [],
    "name": "getPoolStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalLiquidity", "type": "uint256"},
      {"internalType": "uint256", "name": "totalPolicies", "type": "uint256"},
      {"internalType": "uint256", "name": "totalPremiums", "type": "uint256"},
      {"internalType": "uint256", "name": "totalPayouts", "type": "uint256"},
      {"internalType": "uint256", "name": "activePolicies", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "provideLiquidity",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "withdrawLiquidity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract configuration
const POOL_ADDRESS = "0x369b50a492e9de0e4989910bd3594aebd89b5d21";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;

async function main() {
  console.log("🚀 Starting Transaction Spinning on Celo Mainnet");
  console.log("📍 Pool Contract:", POOL_ADDRESS);
  console.log("🌐 RPC URL:", RPC_URL);
  console.log("⛓️  Chain ID:", CHAIN_ID);
  console.log("");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log("👤 Deployer Address:", deployerAddress);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log("💰 Current Balance:", ethers.utils.formatEther(balance), "CELO");
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.error("❌ Insufficient balance. Need at least 0.1 CELO for gas fees.");
    process.exit(1);
  }

  // Create viem clients
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
    account: deployerAddress
  });

  console.log("🔧 Viem clients created successfully");
  console.log("");

  // Transaction spinning loop
  const SPIN_COUNT = 10;
  const DEPOSIT_AMOUNT = parseEther("0.01"); // 0.01 CELO
  const WITHDRAW_AMOUNT = parseEther("0.005"); // 0.005 CELO

  console.log(`🔄 Starting ${SPIN_COUNT} transaction spins...`);
  console.log(`💸 Deposit Amount: ${formatEther(DEPOSIT_AMOUNT)} CELO`);
  console.log(`🏧 Withdraw Amount: ${formatEther(WITHDRAW_AMOUNT)} CELO`);
  console.log("");

  let successfulTransactions = 0;
  let failedTransactions = 0;
  let totalGasUsed = BigInt(0);

  for (let i = 1; i <= SPIN_COUNT; i++) {
    console.log(`\n📍 Spin ${i}/${SPIN_COUNT}`);
    console.log("=" .repeat(50));

    try {
      // 1. Check pool stats
      console.log("📊 1. Checking pool stats...");
      const stats = await publicClient.readContract({
        address: POOL_ADDRESS,
        abi: AGROSHIELD_POOL_ABI,
        functionName: 'getPoolStats'
      });

      console.log("   📈 Pool Stats:");
      console.log(`      Total Liquidity: ${formatEther(stats[0])} CELO`);
      console.log(`      Total Policies: ${stats[1].toString()}`);
      console.log(`      Total Premiums: ${formatEther(stats[2])} CELO`);
      console.log(`      Total Payouts: ${formatEther(stats[3])} CELO`);
      console.log(`      Active Policies: ${stats[4].toString()}`);

      // 2. Deposit liquidity
      console.log("\n💰 2. Depositing liquidity...");
      const depositHash = await walletClient.writeContract({
        address: POOL_ADDRESS,
        abi: AGROSHIELD_POOL_ABI,
        functionName: 'provideLiquidity',
        args: [DEPOSIT_AMOUNT],
        value: DEPOSIT_AMOUNT
      });

      console.log(`   📤 Deposit TX: https://celoscan.io/tx/${depositHash}`);
      
      const depositReceipt = await publicClient.waitForTransactionReceipt({ 
        hash: depositHash 
      });
      
      console.log(`   ✅ Deposit confirmed in block ${depositReceipt.blockNumber}`);
      console.log(`   ⛽ Gas Used: ${depositReceipt.gasUsed.toString()}`);
      totalGasUsed += depositReceipt.gasUsed;

      // 3. Withdraw liquidity
      console.log("\n🏧 3. Withdrawing liquidity...");
      const withdrawHash = await walletClient.writeContract({
        address: POOL_ADDRESS,
        abi: AGROSHIELD_POOL_ABI,
        functionName: 'withdrawLiquidity',
        args: [WITHDRAW_AMOUNT]
      });

      console.log(`   📥 Withdraw TX: https://celoscan.io/tx/${withdrawHash}`);
      
      const withdrawReceipt = await publicClient.waitForTransactionReceipt({ 
        hash: withdrawHash 
      });
      
      console.log(`   ✅ Withdraw confirmed in block ${withdrawReceipt.blockNumber}`);
      console.log(`   ⛽ Gas Used: ${withdrawReceipt.gasUsed.toString()}`);
      totalGasUsed += withdrawReceipt.gasUsed;

      successfulTransactions++;
      console.log(`\n🎉 Spin ${i} completed successfully!`);

      // Wait a bit between spins
      if (i < SPIN_COUNT) {
        console.log("⏳ Waiting 3 seconds before next spin...");
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error(`❌ Spin ${i} failed:`, error.message);
      failedTransactions++;
      
      // Continue with next spin even if current one fails
      if (i < SPIN_COUNT) {
        console.log("⏳ Waiting 3 seconds before next spin...");
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  // Final statistics
  console.log("\n" + "=".repeat(50));
  console.log("📊 TRANSACTION SPINNING SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Successful Spins: ${successfulTransactions}/${SPIN_COUNT}`);
  console.log(`❌ Failed Spins: ${failedTransactions}/${SPIN_COUNT}`);
  console.log(`📈 Success Rate: ${((successfulTransactions / SPIN_COUNT) * 100).toFixed(1)}%`);
  console.log(`⛽ Total Gas Used: ${totalGasUsed.toString()}`);
  console.log(`💸 Total Deposited: ${formatEther(DEPOSIT_AMOUNT * BigInt(successfulTransactions))} CELO`);
  console.log(`🏧 Total Withdrawn: ${formatEther(WITHDRAW_AMOUNT * BigInt(successfulTransactions))} CELO`);
  
  // Check final balance
  const finalBalance = await deployer.getBalance();
  console.log(`💰 Final Balance: ${ethers.utils.formatEther(finalBalance)} CELO`);
  console.log(`📉 Balance Change: ${ethers.utils.formatEther(finalBalance.sub(balance))} CELO`);

  if (successfulTransactions === SPIN_COUNT) {
    console.log("\n🎊 ALL TRANSACTIONS COMPLETED SUCCESSFULLY!");
  } else if (successfulTransactions > 0) {
    console.log("\n⚠️  PARTIAL SUCCESS - Some transactions failed");
  } else {
    console.log("\n❌ ALL TRANSACTIONS FAILED");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
