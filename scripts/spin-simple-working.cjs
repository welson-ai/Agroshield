const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// Minimal ABIs for just the functions we need
const AGROSHIELD_POOL_ABI = [
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

// Use original contract that we know exists
const POOL_ADDRESS = "0xef65b6fe2e9de3fa865aa87107db4bcd458115d5";
const CUSD_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;
const SPIN_AMOUNT = parseEther("0.01"); // 0.01 cUSD per spin

async function main() {
  console.log("🚀 SIMPLE WORKING TRANSACTION SPINNING");
  console.log("======================================");
  
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

    // Transaction spinning loop
    const SPIN_COUNT = 5; // Start with 5 for testing
    console.log(`\n🔄 Starting ${SPIN_COUNT} transaction spins...`);
    console.log(`💵 Amount per spin: ${formatEther(SPIN_AMOUNT)} cUSD`);

    let successfulTransactions = 0;
    let failedTransactions = 0;

    for (let i = 1; i <= SPIN_COUNT; i++) {
      console.log(`\n📍 Spin ${i}/${SPIN_COUNT}`);
      console.log("=".repeat(50));

      try {
        // 1. Approve cUSD
        console.log("🔓 1. Approving cUSD...");
        const allowance = await publicClient.readContract({
          address: CUSD_TOKEN_ADDRESS,
          abi: CUSD_TOKEN_ABI,
          functionName: 'allowance',
          args: [account.address, POOL_ADDRESS]
        });

        if (allowance < SPIN_AMOUNT) {
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

        // 3. Skip withdraw for now (since we need shares calculation)
        console.log("🏧 3. Skipping withdraw (need shares calculation)");
        
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

    if (successfulTransactions === SPIN_COUNT) {
      console.log("\n🎊 ALL DEPOSITS COMPLETED SUCCESSFULLY!");
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
