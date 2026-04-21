const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// Contract ABIs
const AGROSHIELD_POOL_ABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "provideLiquidity",
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
  }
];

// Contract addresses
const POOL_ADDRESS = "0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6";
const CUSD_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;

async function main() {
  console.log("MINIMAL SPINNING - LOW GAS MODE");
  console.log("===============================");
  
  const privateKey = process.env.PRIVATE_KEY;
  const account = privateKeyToAccount(privateKey);
  console.log("Account:", account.address);

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
    const cusdBalance = await publicClient.readContract({
      address: CUSD_TOKEN_ADDRESS,
      abi: CUSD_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [account.address]
    });

    console.log("CELO Balance:", formatEther(celoBalance), "CELO");
    console.log("cUSD Balance:", formatEther(cusdBalance), "cUSD");

    // Ultra-low gas requirement
    const minCeloForGas = parseEther("0.005"); // Only 0.005 CELO needed
    if (celoBalance < minCeloForGas) {
      console.log("Need at least 0.005 CELO for minimal testing");
      console.log("Current deficit:", formatEther(minCeloForGas - celoBalance), "CELO");
      process.exit(1);
    }

    // Minimal spin amount
    const SPIN_AMOUNT = parseEther("0.0001"); // Only 0.0001 cUSD
    const SPIN_COUNT = 2; // Just 2 spins for testing

    console.log(`\nStarting ${SPIN_COUNT} minimal spins...`);
    console.log(`Amount per spin: ${formatEther(SPIN_AMOUNT)} cUSD`);

    let successfulTransactions = 0;
    let failedTransactions = 0;

    for (let i = 1; i <= SPIN_COUNT; i++) {
      console.log(`\nSpin ${i}/${SPIN_COUNT}`);
      console.log("-".repeat(30));

      try {
        // Check if we have enough cUSD
        if (cusdBalance < SPIN_AMOUNT) {
          console.log("Insufficient cUSD balance");
          failedTransactions++;
          continue;
        }

        // 1. Approve cUSD (minimal gas)
        console.log("Approving cUSD...");
        const approveHash = await walletClient.writeContract({
          address: CUSD_TOKEN_ADDRESS,
          abi: CUSD_TOKEN_ABI,
          functionName: 'approve',
          args: [POOL_ADDRESS, SPIN_AMOUNT],
          gas: BigInt(50000) // Minimal gas limit
        });

        console.log("Approve TX:", `https://celoscan.io/tx/${approveHash}`);
        
        const approveReceipt = await publicClient.waitForTransactionReceipt({ 
          hash: approveHash 
        });
        
        console.log("Approval confirmed");

        // 2. Deposit cUSD (minimal gas)
        console.log("Depositing cUSD...");
        
        const depositHash = await walletClient.writeContract({
          address: POOL_ADDRESS,
          abi: AGROSHIELD_POOL_ABI,
          functionName: 'provideLiquidity',
          args: [SPIN_AMOUNT],
          gas: BigInt(80000) // Minimal gas limit
        });

        console.log("Deposit TX:", `https://celoscan.io/tx/${depositHash}`);
        
        const depositReceipt = await publicClient.waitForTransactionReceipt({ 
          hash: depositHash 
        });
        
        console.log("Deposit confirmed");

        successfulTransactions++;
        console.log("Spin completed successfully!");

        // Update cUSD balance
        cusdBalance = await publicClient.readContract({
          address: CUSD_TOKEN_ADDRESS,
          abi: CUSD_TOKEN_ABI,
          functionName: 'balanceOf',
          args: [account.address]
        });

        // Wait between spins
        if (i < SPIN_COUNT) {
          console.log("Waiting 5 seconds...");
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

      } catch (error) {
        console.error("Spin failed:", error.message);
        failedTransactions++;
      }
    }

    // Final summary
    console.log("\n" + "=".repeat(40));
    console.log("MINIMAL SPINNING SUMMARY");
    console.log("=".repeat(40));
    console.log(`Successful: ${successfulTransactions}/${SPIN_COUNT}`);
    console.log(`Failed: ${failedTransactions}/${SPIN_COUNT}`);
    console.log(`Success Rate: ${((successfulTransactions / SPIN_COUNT) * 100).toFixed(1)}%`);

    // Check final balances
    const finalCeloBalance = await publicClient.getBalance({ address: account.address });
    const finalCusdBalance = await publicClient.readContract({
      address: CUSD_TOKEN_ADDRESS,
      abi: CUSD_TOKEN_ABI,
      functionName: 'balanceOf',
      args: [account.address]
    });

    console.log("Final CELO:", formatEther(finalCeloBalance), "CELO");
    console.log("Final cUSD:", formatEther(finalCusdBalance), "cUSD");

    if (successfulTransactions > 0) {
      console.log("\nSUCCESS! Transactions completed!");
    } else {
      console.log("\nAll transactions failed - check gas or contract");
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
