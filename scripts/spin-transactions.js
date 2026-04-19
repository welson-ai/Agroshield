const { ethers } = require("hardhat");
const { createPublicClient, createWalletClient, http, parseEther, formatEther, Hex } = require("viem");
const { celo } = require("viem/chains");

// Contract ABIs (minimal for functions we need)
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
    "stateMutability": "nonpayable",
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
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {"internalType": "uint8", "name": "", "type": "uint8"}
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

// Contract configuration
const POOL_ADDRESS = "0x369b50a492e9de0e4989910bd3594aebd89b5d21";
const CUSD_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;
const SPIN_AMOUNT = parseEther("0.01"); // 0.01 cUSD per spin

async function main() {
  console.log("🚀 Starting Transaction Spinning on Celo Mainnet");
  console.log("📍 Pool Contract:", POOL_ADDRESS);
  console.log("📍 cUSD Token Contract:", CUSD_TOKEN_ADDRESS);
  console.log("🌐 RPC URL:", RPC_URL);
  console.log("⛓️  Chain ID:", CHAIN_ID);
  console.log("");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  
  console.log("👤 Deployer Address:", deployerAddress);
  
  // Check CELO balance for gas fees
  const celoBalance = await deployer.getBalance();
  console.log("💰 Current CELO Balance:", ethers.utils.formatEther(celoBalance), "CELO");
  
  if (celoBalance.lt(ethers.utils.parseEther("0.1"))) {
    console.error("❌ Insufficient CELO balance. Need at least 0.1 CELO for gas fees.");
    process.exit(1);
  }

  // Check cUSD balance
  const cusdBalance = await publicClient.readContract({
    address: CUSD_TOKEN_ADDRESS,
    abi: CUSD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [deployerAddress]
  });
  console.log("💵 Current cUSD Balance:", formatEther(cusdBalance), "cUSD");
  
  const totalCusdNeeded = SPIN_AMOUNT * BigInt(25);
  
  if (cusdBalance < totalCusdNeeded) {
    console.error("❌ Insufficient cUSD balance. Need at least", formatEther(totalCusdNeeded), "cUSD for transactions.");
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
  const SPIN_COUNT = 25;

  console.log(`🔄 Starting ${SPIN_COUNT} transaction spins...`);
  console.log(`💵 Transaction Amount: ${formatEther(SPIN_AMOUNT)} cUSD`);
  console.log(`💸 Total cUSD Needed: ${formatEther(SPIN_AMOUNT * BigInt(SPIN_COUNT))} cUSD`);
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
      console.log(`      Total Liquidity: ${formatEther(stats[0])} cUSD`);
      console.log(`      Total Policies: ${stats[1].toString()}`);
      console.log(`      Total Premiums: ${formatEther(stats[2])} cUSD`);
      console.log(`      Total Payouts: ${formatEther(stats[3])} cUSD`);
      console.log(`      Active Policies: ${stats[4].toString()}`);

      // 2. Approve cUSD
      console.log("\n🔓 2. Approving cUSD...");
      const allowance = await publicClient.readContract({
        address: CUSD_TOKEN_ADDRESS,
        abi: CUSD_TOKEN_ABI,
        functionName: 'allowance',
        args: [deployerAddress, POOL_ADDRESS]
      });

      console.log(`   📋 Current Allowance: ${formatEther(allowance)} cUSD`);

      if (allowance < SPIN_AMOUNT) {
        const approveHash = await walletClient.writeContract({
          address: CUSD_TOKEN_ADDRESS,
          abi: CUSD_TOKEN_ABI,
          functionName: 'approve',
          args: [POOL_ADDRESS, SPIN_AMOUNT * BigInt(2)] // Approve extra for safety
        });

        console.log(`   📤 Approve TX: https://celoscan.io/tx/${approveHash}`);
        
        const approveReceipt = await publicClient.waitForTransactionReceipt({ 
          hash: approveHash 
        });
        
        console.log(`   ✅ Approval confirmed in block ${approveReceipt.blockNumber}`);
        console.log(`   ⛽ Gas Used: ${approveReceipt.gasUsed.toString()}`);
        totalGasUsed += approveReceipt.gasUsed;
      } else {
        console.log("   ✅ Sufficient allowance already exists");
      }

      // 3. Deposit cUSD into pool
      console.log("\n💰 3. Depositing cUSD into pool...");
      const depositHash = await walletClient.writeContract({
        address: POOL_ADDRESS,
        abi: AGROSHIELD_POOL_ABI,
        functionName: 'provideLiquidity',
        args: [SPIN_AMOUNT]
      });

      console.log(`   📤 Deposit TX: https://celoscan.io/tx/${depositHash}`);
      
      const depositReceipt = await publicClient.waitForTransactionReceipt({ 
        hash: depositHash 
      });
      
      console.log(`   ✅ Deposit confirmed in block ${depositReceipt.blockNumber}`);
      console.log(`   ⛽ Gas Used: ${depositReceipt.gasUsed.toString()}`);
      totalGasUsed += depositReceipt.gasUsed;

      // 4. Withdraw cUSD from pool
      console.log("\n🏧 4. Withdrawing cUSD from pool...");
      const withdrawHash = await walletClient.writeContract({
        address: POOL_ADDRESS,
        abi: AGROSHIELD_POOL_ABI,
        functionName: 'withdrawLiquidity',
        args: [SPIN_AMOUNT]
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
        console.log("⏳ Waiting 2 seconds before next spin...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error(`❌ Spin ${i} failed:`, error.message);
      failedTransactions++;
      
      // Continue with next spin even if current one fails
      if (i < SPIN_COUNT) {
        console.log("⏳ Waiting 2 seconds before next spin...");
        await new Promise(resolve => setTimeout(resolve, 2000));
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
  console.log(`💸 Total cUSD Deposited: ${formatEther(SPIN_AMOUNT * BigInt(successfulTransactions))} cUSD`);
  console.log(`🏧 Total cUSD Withdrawn: ${formatEther(SPIN_AMOUNT * BigInt(successfulTransactions))} cUSD`);
  
  // Check final balances
  const finalCeloBalance = await deployer.getBalance();
  const finalCusdBalance = await publicClient.readContract({
    address: CUSD_TOKEN_ADDRESS,
    abi: CUSD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [deployerAddress]
  });
  
  console.log(`💰 Final CELO Balance: ${ethers.utils.formatEther(finalCeloBalance)} CELO`);
  console.log(`� Final cUSD Balance: ${formatEther(finalCusdBalance)} cUSD`);
  console.log(`📉 CELO Change: ${ethers.utils.formatEther(finalCeloBalance.sub(celoBalance))} CELO`);
  console.log(`📉 cUSD Change: ${formatEther(finalCusdBalance - cusdBalance)} cUSD`);

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
