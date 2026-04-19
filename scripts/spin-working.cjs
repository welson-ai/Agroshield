const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// Contract ABIs based on actual available functions
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
  console.log("🚀 WORKING TRANSACTION SPINNING SCRIPT");
  console.log("==========================================");
  
  // Check environment
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("ERROR: PRIVATE_KEY not found in .env file");
    process.exit(1);
  }

  // Create account from private key
  const account = privateKeyToAccount(privateKey);
  console.log("👤 Account Address:", account.address);

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
    account: account
  });

  console.log("🔧 Viem clients created successfully");

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

    // Check if sufficient funds
    const totalCusdNeeded = SPIN_AMOUNT * BigInt(5); // 5 spins for testing
    if (cusdBalance < totalCusdNeeded) {
      console.error("❌ Insufficient cUSD balance. Need at least", formatEther(totalCusdNeeded), "cUSD");
      console.log("💡 Get cUSD from: https://app.ubeswap.org/ or https://celo.sushi.com/");
      process.exit(1);
    }

    if (celoBalance < parseEther("0.01")) {
      console.error("❌ Insufficient CELO balance. Need at least 0.01 CELO for gas");
      process.exit(1);
    }

    console.log("✅ Balance checks passed");

    // Check pool stats
    console.log("\n📊 Checking Pool Stats...");
    const totalLiquidity = await publicClient.readContract({
      address: POOL_ADDRESS,
      abi: AGROSHIELD_POOL_ABI,
      functionName: 'totalLiquidity'
    });
    console.log("📈 Total Pool Liquidity:", formatEther(totalLiquidity), "cUSD");

    // Transaction spinning loop
    const SPIN_COUNT = 5; // Reduced for testing
    console.log(`\n🔄 Starting ${SPIN_COUNT} transaction spins...`);
    console.log(`💵 Amount per spin: ${formatEther(SPIN_AMOUNT)} cUSD`);

    let successfulTransactions = 0;
    let failedTransactions = 0;

    for (let i = 1; i <= SPIN_COUNT; i++) {
      console.log(`\n📍 Spin ${i}/${SPIN_COUNT}`);
      console.log("=".repeat(50));

      try {
        // 1. Check current allowance
        console.log("🔓 1. Checking cUSD allowance...");
        const allowance = await publicClient.readContract({
          address: CUSD_TOKEN_ADDRESS,
          abi: CUSD_TOKEN_ABI,
          functionName: 'allowance',
          args: [account.address, POOL_ADDRESS]
        });
        console.log(`📋 Current Allowance: ${formatEther(allowance)} cUSD`);

        // Approve if needed
        if (allowance < SPIN_AMOUNT) {
          console.log("🔐 Approving cUSD...");
          const approveHash = await walletClient.writeContract({
            address: CUSD_TOKEN_ADDRESS,
            abi: CUSD_TOKEN_ABI,
            functionName: 'approve',
            args: [POOL_ADDRESS, SPIN_AMOUNT * BigInt(2)]
          });

          console.log(`📤 Approve TX: https://celoscan.io/tx/${approveHash}`);
          
          const approveReceipt = await publicClient.waitForTransactionReceipt({ 
            hash: approveHash 
          });
          
          console.log(`✅ Approval confirmed in block ${approveReceipt.blockNumber}`);
          console.log(`⛽ Gas Used: ${approveReceipt.gasUsed.toString()}`);
        } else {
          console.log("✅ Sufficient allowance already exists");
        }

        // 2. Deposit cUSD
        console.log("💰 2. Depositing cUSD into pool...");
        const depositHash = await walletClient.writeContract({
          address: POOL_ADDRESS,
          abi: AGROSHIELD_POOL_ABI,
          functionName: 'provideLiquidity',
          args: [SPIN_AMOUNT]
        });

        console.log(`📤 Deposit TX: https://celoscan.io/tx/${depositHash}`);
        
        const depositReceipt = await publicClient.waitForTransactionReceipt({ 
          hash: depositHash 
        });
        
        console.log(`✅ Deposit confirmed in block ${depositReceipt.blockNumber}`);
        console.log(`⛽ Gas Used: ${depositReceipt.gasUsed.toString()}`);

        // 3. Withdraw cUSD
        console.log("🏧 3. Withdrawing cUSD from pool...");
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

        successfulTransactions++;
        console.log(`🎉 Spin ${i} completed successfully!`);

        // Check updated pool liquidity
        const updatedLiquidity = await publicClient.readContract({
          address: POOL_ADDRESS,
          abi: AGROSHIELD_POOL_ABI,
          functionName: 'totalLiquidity'
        });
        console.log(`📈 Updated Pool Liquidity: ${formatEther(updatedLiquidity)} cUSD`);

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
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
