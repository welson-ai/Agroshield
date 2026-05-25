const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const WALLETS_FILE = path.join(__dirname, "..", "generated-wallets.json");

async function main() {
  const [mainWallet] = await hre.ethers.getSigners();
  const provider = hre.ethers.provider;

  console.log("💰 Funding wallets...");
  console.log("👤 Main Wallet:", mainWallet.address);

  if (!fs.existsSync(WALLETS_FILE)) {
    console.error("❌ No wallets found! Run: npm run generate");
    process.exit(1);
  }

  const wallets = JSON.parse(fs.readFileSync(WALLETS_FILE, "utf8"));
  console.log(`📂 Loaded ${wallets.length} wallets`);

  const MIN_BALANCE = hre.ethers.parseEther(process.env.MIN_BALANCE || "0.1");
  const PING_GAS = 30000;
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || 25000000000n;
  const fundAmount = BigInt(PING_GAS) * gasPrice + hre.ethers.parseEther("0.001");
  
  console.log(`\n⛽ Funding each wallet: ${hre.ethers.formatEther(fundAmount)} CELO`);
  console.log(`💡 Estimated total: ${hre.ethers.formatEther(fundAmount * BigInt(wallets.length))} CELO\n`);

  let funded = 0;
  let failed = 0;

  for (let i = 0; i < wallets.length; i++) {
    const mainBal = await provider.getBalance(mainWallet.address);
    if (mainBal < MIN_BALANCE) {
      console.log(`\n⚠️  Main wallet low (${hre.ethers.formatEther(mainBal)} CELO). Stopping.`);
      break;
    }

    try {
      const tx = await mainWallet.sendTransaction({
        to: wallets[i].address,
        value: fundAmount,
      });
      await tx.wait();
      funded++;
      if ((i + 1) % 20 === 0) {
        console.log(`[${i + 1}/${wallets.length}] ✅ Funded`);
      }
    } catch (e) {
      console.log(`[${i + 1}/${wallets.length}] ❌ Failed: ${e.message.slice(0, 60)}`);
      failed++;
    }
  }

  console.log(`\n========== FUNDING SUMMARY ==========`);
  console.log(`Funded:  ${funded}/${wallets.length}`);
  console.log(`Failed:  ${failed}`);
  console.log(`Main balance: ${hre.ethers.formatEther(await provider.getBalance(mainWallet.address))} CELO`);
}

main().catch(console.error);
