const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// Minimal ABI for CELO-based liquidity pool
const AGROSHIELD_POOL_ABI = [
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

// Use the working contract address
const POOL_ADDRESS = "0xef65b6fe2e9de3fa865aa87107db4bcd458115d5";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;
const SPIN_AMOUNT = parseEther("0.001"); // 0.001 CELO per spin (small amount)

async function main() {
  console.log("🚀 CELO-BASED TRANSACTION SPINNING");
  console.log("==================================");
  
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
    // Check CELO balance
    const celoBalance = await publicClient.getBalance({ address: account.address });
    console.log("💰 CELO Balance:", formatEther(celoBalance), "CELO");

    const totalNeeded = SPIN_AMOUNT * BigInt(25);
    if (celoBalance < totalNeeded) {
      console.error("❌ Insufficient CELO balance. Need at least", formatEther(totalNeeded), "CELO");
      process.exit(1);
    }

    // Transaction spinning loop
    const SPIN_COUNT = 25;
    console.log(`\n🔄 Starting ${SPIN_COUNT} transaction spins...`);
    console.log(`💰 Amount per spin: ${formatEther(SPIN_AMOUNT)} CELO`);

    let successfulTransactions = 0;
    let failedTransactions = 0;
    let totalGasUsed = BigInt(0);

    for (let i = 1; i <= SPIN_COUNT; i++) {
      console.log(`\n📍 Spin ${i}/${SPIN_COUNT}`);
      console.log("=".repeat(50));

      try {
        // 1. Deposit CELO (with value)
        console.log("💰 1. Depositing CELO into pool...");
        const depositHash = await walletClient.writeContract({
          address: POOL_ADDRESS,
          abi: AGROSHIELD_POOL_ABI,
          functionName: 'provideLiquidity',
          args: [SPIN_AMOUNT],
          value: SPIN_AMOUNT // Send CELO with the transaction
        });

        console.log(`📤 Deposit TX: https://celoscan.io/tx/${depositHash}`);
        
        const depositReceipt = await publicClient.waitForTransactionReceipt({ 
          hash: depositHash 
        });
        
        console.log(`✅ Deposit confirmed in block ${depositReceipt.blockNumber}`);
        console.log(`⛽ Gas Used: ${depositReceipt.gasUsed.toString()}`);
        totalGasUsed += depositReceipt.gasUsed;

        // 2. Withdraw CELO
        console.log("🏧 2. Withdrawing CELO from pool...");
        const withdrawHash = await walletClient.writeContract({
          address: POOL_ADDRESS,
          abi: AGROSHIELD_POOL_ABI,
          functionName: 'withdrawLiquidity',
          args: [SPIN_AMOUNT]
        });

        console.log(`📥 Withdraw TX: https://celoscan.io/tx/${withdrawHash}`);
        
        const withdrawReceipt = await publicClient.waitForTransactionReceipt({ 
          hash: withdrawHash 
        });
        
        console.log(`✅ Withdraw confirmed in block ${withdrawReceipt.blockNumber}`);
        console.log(`⛽ Gas Used: ${withdrawReceipt.gasUsed.toString()}`);
        totalGasUsed += withdrawReceipt.gasUsed;

        successfulTransactions++;
        console.log(`🎉 Spin ${i} completed successfully!`);

        // Wait between spins
        if (i < SPIN_COUNT) {
          console.log("⏳ Waiting 2 seconds before next spin...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`❌ Spin ${i} failed:`, error.message);
        failedTransactions++;
        
        if (i < SPIN_COUNT) {
          console.log("⏳ Waiting 2 seconds before next spin...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // Final summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 TRANSACTION SPINNING SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Successful Spins: ${successfulTransactions}/${SPIN_COUNT}`);
    console.log(`❌ Failed Spins: ${failedTransactions}/${SPIN_COUNT}`);
    console.log(`📈 Success Rate: ${((successfulTransactions / SPIN_COUNT) * 100).toFixed(1)}%`);
    console.log(`⛽ Total Gas Used: ${totalGasUsed.toString()}`);

    // Check final balance
    const finalCeloBalance = await publicClient.getBalance({ address: account.address });
    console.log(`💰 Final CELO Balance: ${formatEther(finalCeloBalance)} CELO`);
    console.log(`📉 CELO Change: ${formatEther(finalCeloBalance - celoBalance)} CELO`);

    if (successfulTransactions === SPIN_COUNT) {
      console.log("\n🎊 ALL TRANSACTIONS COMPLETED SUCCESSFULLY!");
    } else if (successfulTransactions > 0) {
      console.log("\n⚠️  PARTIAL SUCCESS - Some transactions failed");
    } else {
      console.log("\n❌ ALL TRANSACTIONS FAILED");
    }

  } catch (error) {
    console.error("Script failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
