const { createPublicClient, http, formatEther } = require("viem");
require('dotenv').config();

async function main() {
  console.log("CELO GAS ANALYZER");
  console.log("==================");
  
  const RPC_URL = "https://forno.celo.org";
  const CHAIN_ID = 42220;

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

  try {
    // Get current gas price
    const gasPrice = await publicClient.getGasPrice();
    console.log("Current Gas Price:", formatEther(gasPrice), "CELO");
    
    // Get latest block
    const latestBlock = await publicClient.getBlock();
    console.log("Latest Block:", latestBlock.number);
    console.log("Base Fee:", formatEther(latestBlock.baseFeePerGas || BigInt(0)), "CELO");
    
    // Calculate costs for different operations
    const approveGas = BigInt(50000);
    const depositGas = BigInt(80000);
    
    const approveCost = gasPrice * approveGas;
    const depositCost = gasPrice * depositGas;
    const totalCost = approveCost + depositCost;
    
    console.log("\nTRANSACTION COSTS:");
    console.log("Approve Gas:", approveGas.toString(), "gas");
    console.log("Approve Cost:", formatEther(approveCost), "CELO");
    console.log("Deposit Gas:", depositGas.toString(), "gas");
    console.log("Deposit Cost:", formatEther(depositCost), "CELO");
    console.log("Total Cost:", formatEther(totalCost), "CELO");
    
    // Check if gas price is high
    const normalGasPrice = BigInt("20000000000"); // 20 gwei
    const currentGwei = Number(gasPrice) / 1e9;
    
    console.log("\nGAS ANALYSIS:");
    console.log("Current Gas (gwei):", currentGwei.toFixed(2));
    console.log("Normal Gas (gwei):", 20);
    console.log("Gas Multiplier:", (currentGwei / 20).toFixed(2), "x");
    
    if (currentGwei > 50) {
      console.log("WARNING: Gas prices are very high!");
      console.log("RECOMMENDATION: Wait for lower gas prices");
    }
    
    // Suggest optimal timing
    console.log("\nRECOMMENDATIONS:");
    console.log("1. Wait for gas price to drop below 20 gwei");
    console.log("2. Add more CELO to handle high gas costs");
    console.log("3. Use batch transactions when possible");
    console.log("4. Monitor gas prices at: https://celoscan.io/gastracker");
    
    // Calculate needed CELO for different scenarios
    console.log("\nCELO NEEDED FOR TRANSACTIONS:");
    console.log("1 Spin (high gas):", formatEther(totalCost * BigInt(2)), "CELO");
    console.log("5 Spins (high gas):", formatEther(totalCost * BigInt(5)), "CELO");
    console.log("10 Spins (high gas):", formatEther(totalCost * BigInt(10)), "CELO");
    
    console.log("\nLOW GAS COSTS (when gas < 20 gwei):");
    const lowGasPrice = normalGasPrice;
    const lowApproveCost = lowGasPrice * approveGas;
    const lowDepositCost = lowGasPrice * depositGas;
    const lowTotalCost = lowApproveCost + lowDepositCost;
    
    console.log("1 Spin (low gas):", formatEther(lowTotalCost * BigInt(2)), "CELO");
    console.log("5 Spins (low gas):", formatEther(lowTotalCost * BigInt(5)), "CELO");
    console.log("10 Spins (low gas):", formatEther(lowTotalCost * BigInt(10)), "CELO");
    
  } catch (error) {
    console.error("Error analyzing gas:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
