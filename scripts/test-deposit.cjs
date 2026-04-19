const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// Contract configuration
const POOL_ADDRESS = "0x369b50a492e9de0e4989910bd3594aebd89b5d21";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;

async function main() {
  console.log("=== TESTING DEPOSIT FUNCTIONS ===");
  
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
      }
    },
    transport: http(RPC_URL),
    account: account
  });

  try {
    // Test 1: Try deposit with CELO (native token)
    console.log("\n=== TESTING NATIVE CELO DEPOSIT ===");
    
    const celoBalance = await publicClient.getBalance({ address: account.address });
    console.log("CELO Balance:", formatEther(celoBalance));
    
    const depositAmount = parseEther("0.001"); // 0.001 CELO
    
    try {
      const depositHash = await walletClient.writeContract({
        address: POOL_ADDRESS,
        abi: [{"inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "deposit", "outputs": [], "stateMutability": "payable", "type": "function"}],
        functionName: 'deposit',
        args: [depositAmount],
        value: depositAmount
      });

      console.log("Deposit TX:", depositHash);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: depositHash });
      console.log("Deposit confirmed:", receipt.blockNumber);
      
    } catch (e) {
      console.log("deposit() failed:", e.message.split('\n')[0]);
    }

    // Test 2: Try provideLiquidity with CELO
    console.log("\n=== TESTING provideLiquidity WITH CELO ===");
    
    try {
      const provideHash = await walletClient.writeContract({
        address: POOL_ADDRESS,
        abi: [{"inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "provideLiquidity", "outputs": [], "stateMutability": "payable", "type": "function"}],
        functionName: 'provideLiquidity',
        args: [depositAmount],
        value: depositAmount
      });

      console.log("ProvideLiquidity TX:", provideHash);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: provideHash });
      console.log("ProvideLiquidity confirmed:", receipt.blockNumber);
      
    } catch (e) {
      console.log("provideLiquidity() with CELO failed:", e.message.split('\n')[0]);
    }

    // Test 3: Try provideLiquidity without CELO (cUSD)
    console.log("\n=== TESTING provideLiquidity WITHOUT CELO (cUSD) ===");
    
    try {
      const provideHash = await walletClient.writeContract({
        address: POOL_ADDRESS,
        abi: [{"inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "provideLiquidity", "outputs": [], "stateMutability": "nonpayable", "type": "function"}],
        functionName: 'provideLiquidity',
        args: [depositAmount]
      });

      console.log("ProvideLiquidity TX:", provideHash);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: provideHash });
      console.log("ProvideLiquidity confirmed:", receipt.blockNumber);
      
    } catch (e) {
      console.log("provideLiquidity() without CELO failed:", e.message.split('\n')[0]);
    }

    // Test 4: Check if contract accepts CELO directly
    console.log("\n=== TESTING DIRECT CELO TRANSFER ===");
    
    try {
      const transferHash = await walletClient.sendTransaction({
        to: POOL_ADDRESS,
        value: depositAmount
      });

      console.log("Transfer TX:", transferHash);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: transferHash });
      console.log("Transfer confirmed:", receipt.blockNumber);
      
    } catch (e) {
      console.log("Direct transfer failed:", e.message.split('\n')[0]);
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
