const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const WALLETS_FILE = path.join(__dirname, "..", "generated-wallets.json");

async function main() {
  const provider = hre.ethers.provider;
  const CONTRACT_ADDRESS = process.env.AGROINVEST_ADDRESS || "";

  console.log("📡 Pinging contract...");
  console.log("📍 Contract:", CONTRACT_ADDRESS);

  if (!CONTRACT_ADDRESS) {
    console.error("❌ Set AGROINVEST_ADDRESS in .env first!");
    process.exit(1);
  }

  if (!fs.existsSync(WALLETS_FILE)) {
    console.error("❌ No wallets found! Run: npm run generate && npm run fund");
    process.exit(1);
  }

  const wallets = JSON.parse(fs.readFileSync(WALLETS_FILE, "utf8"));
  console.log(`📂 Loaded ${wallets.length} wallets\n`);

  const ABI = ["function ping() external"];
  const contract = new hre.ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  const PROGRESS_INTERVAL = 10;
  const PING_GAS = 30000; // Safe buffer for ping

  let totalGasUsed = 0n;
  let totalCost = 0n;
  let successful = 0;
  let failed = 0;

  // Only process first 110 funded wallets
  const FUNDED_COUNT = 110;
  console.log(`\n🚀 Starting ${FUNDED_COUNT} pings...\n`);
  
  for (let i = 0; i < Math.min(FUNDED_COUNT, wallets.length); i++) {
    const w = wallets[i];
    const signer = new hre.ethers.Wallet(w.privateKey, provider);

    console.log(`[${i+1}/${FUNDED_COUNT}] Pinging...`);
    
    try {
      const tx = await contract.connect(signer).ping();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      totalGasUsed += receipt.gasUsed;
      totalCost += gasCost;
      successful++;
      console.log(`[${i+1}/${FUNDED_COUNT}] ✅ Done! Gas: ${receipt.gasUsed}`);
    } catch (e) {
      console.log(`[${i+1}/${FUNDED_COUNT}] ❌ ${e.message.slice(0, 50)}`);
      failed++;
    }
  }

  console.log("\n========== PING SUMMARY ==========");
  console.log(`Successful: ${successful}/${wallets.length}`);
  console.log(`Failed:     ${failed}`);
  console.log(`Total gas:  ${totalGasUsed}`);
  console.log(`Total cost: ${hre.ethers.formatEther(totalCost)} CELO`);
  if (successful > 0) console.log(`Avg cost:   ${hre.ethers.formatEther(totalCost / BigInt(successful))} CELO`);
}

main().catch(console.error);
