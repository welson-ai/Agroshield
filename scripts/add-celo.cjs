const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

// Faucet and exchange information
const CELO_FAUCET = "https://celo.org/developers/faucet";
const BINANCE_CELO = "https://www.binance.com/en/trade/CELO_USDT";
const COINBASE_CELO = "https://www.coinbase.com/price/celo";

async function main() {
  console.log("💰 CELO BALANCE CHECK AND FUNDS GUIDE");
  console.log("=====================================");
  
  const privateKey = process.env.PRIVATE_KEY;
  const account = privateKeyToAccount(privateKey);
  
  const publicClient = createPublicClient({
    chain: {
      id: 42220,
      name: 'Celo',
      nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://forno.celo.org'] },
        public: { http: ['https://forno.celo.org'] }
      },
      blockExplorers: {
        default: { name: 'Celo Explorer', url: 'https://celoscan.io' }
      }
    },
    transport: http('https://forno.celo.org')
  });

  try {
    // Check current balances
    const celoBalance = await publicClient.getBalance({ address: account.address });
    const usdBalance = parseFloat(formatEther(celoBalance)) * 0.6; // Approximate CELO price
    
    console.log("👤 Account Address:", account.address);
    console.log("💰 Current CELO Balance:", formatEther(celoBalance), "CELO");
    console.log("💵 Approximate USD Value:", `$${usdBalance.toFixed(2)}`);
    
    // Calculate needed for transactions
    const neededForGas = parseEther("0.05"); // 0.05 CELO for gas
    const neededTotal = neededForGas;
    const deficit = neededTotal > celoBalance ? neededTotal - celoBalance : BigInt(0);
    
    console.log("\n📊 TRANSACTION REQUIREMENTS:");
    console.log("⛽ Gas needed for 50 spins:", formatEther(neededForGas), "CELO");
    console.log("📉 Current deficit:", formatEther(deficit), "CELO");
    
    if (deficit > 0) {
      console.log("\n⚠️  INSUFFICIENT FUNDS FOR TRANSACTIONS");
      console.log("\n🚰 FUNDING OPTIONS:");
      console.log("1. CELO FAUCET (Free):");
      console.log("   🌐", CELO_FAUCET);
      console.log("   📝 Request test CELO (if available)");
      
      console.log("\n2. BUY CELO:");
      console.log("   🏦 Binance:", BINANCE_CELO);
      console.log("   🏦 Coinbase:", COINBASE_CELO);
      console.log("   💰 Need to buy at least:", formatEther(deficit), "CELO");
      
      console.log("\n3. TRANSFER TO WALLET:");
      console.log("   📤 Send CELO to:", account.address);
      console.log("   📱 From exchange or another wallet");
      
      console.log("\n💡 QUICK TIP:");
      console.log("   • Buy 0.1 CELO to be safe for multiple transaction batches");
      console.log("   • Current CELO price: ~$0.60 USD");
      console.log("   • 0.1 CELO ≈ $0.06 USD");
      
      console.log("\n🔄 AFTER FUNDING:");
      console.log("   1. Wait for transaction confirmation");
      console.log("   2. Run: npm run spin-fixed");
      console.log("   3. Or run: npm run spin-full (for 50 spins)");
      
    } else {
      console.log("\n✅ SUFFICIENT FUNDS FOR TRANSACTIONS!");
      console.log("🚀 Ready to run spinning scripts");
      console.log("💡 Run: npm run spin-fixed");
    }
    
    // Show alternative minimal spin option
    console.log("\n🎯 MINIMAL TESTING OPTION:");
    console.log("   • Can test with 0.001 CELO for 1-2 transactions");
    console.log("   • Run: npm run spin-minimal (if available)");
    
  } catch (error) {
    console.error("❌ Error checking balance:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
