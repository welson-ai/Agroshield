const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const WALLETS_FILE = path.join(__dirname, "..", "generated-wallets.json");

async function main() {
  const provider = hre.ethers.provider;
  const wallets = JSON.parse(fs.readFileSync(WALLETS_FILE, "utf8"));
  
  let funded = 0;
  let totalBalance = 0n;
  
  console.log("🔍 Checking funded wallets...\n");
  
  for (let i = 0; i < wallets.length; i++) {
    const bal = await provider.getBalance(wallets[i].address);
    if (bal > 0n) {
      funded++;
      totalBalance += bal;
    }
  }
  
  console.log(`✅ Funded wallets: ${funded}/${wallets.length}`);
  console.log(`💰 Total CELO in wallets: ${hre.ethers.formatEther(totalBalance)} CELO`);
  console.log(`\n👉 Run 'npm run ping' to use these wallets`);
}

main().catch(console.error);
