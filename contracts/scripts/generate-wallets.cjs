const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const WALLETS_FILE = path.join(__dirname, "..", "generated-wallets.json");
const TARGET_WALLETS = parseInt(process.env.TARGET_WALLETS) || 500;

async function main() {
  console.log("🔑 Generating wallets...");
  console.log(`   Target: ${TARGET_WALLETS} wallets`);
  
  const wallets = [];
  for (let i = 0; i < TARGET_WALLETS; i++) {
    const w = hre.ethers.Wallet.createRandom();
    wallets.push({ address: w.address, privateKey: w.privateKey });
    if ((i + 1) % 100 === 0) console.log(`   ${i + 1}/${TARGET_WALLETS} done...`);
  }
  
  fs.writeFileSync(WALLETS_FILE, JSON.stringify(wallets, null, 2));
  console.log(`\n✅ ${wallets.length} wallets saved to generated-wallets.json`);
}

main().catch(console.error);
