const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const WALLETS_FILE = path.join(__dirname, "..", "generated-wallets.json");

async function main() {
  const [mainWallet] = await hre.ethers.getSigners();
  const provider = hre.ethers.provider;

  // --- CONFIG ---
  const TARGET_WALLETS = 500;
  const MIN_BALANCE = hre.ethers.parseEther("0.1");
  const PROGRESS_INTERVAL = 20;
  const PING_GAS = 30000; // generous buffer (actual ~18k)
  const CONTRACT_ADDRESS = process.env.AGROINVEST_ADDRESS || "";

  console.log("🚀 AGROINVEST DAU BOOST");
  console.log("==========================");
  console.log("👤 Main Wallet:", mainWallet.address);

  if (!CONTRACT_ADDRESS) {
    console.error("❌ Set AGROINVEST_ADDRESS in .env first!");
    process.exit(1);
  }

  // Minimal ABI
  const ABI = ["function ping() external", "event Interaction(address indexed user, uint256 timestamp)"];
  const contract = new hre.ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

  // 1) GENERATE OR LOAD WALLETS
  let wallets;
  if (fs.existsSync(WALLETS_FILE)) {
    console.log("📂 Loading existing wallets...");
    wallets = JSON.parse(fs.readFileSync(WALLETS_FILE, "utf8"));
  } else {
    console.log(`🔑 Generating ${TARGET_WALLETS} wallets...`);
    wallets = [];
    for (let i = 0; i < TARGET_WALLETS; i++) {
      const w = hre.ethers.Wallet.createRandom();
      wallets.push({ address: w.address, privateKey: w.privateKey });
    }
    fs.writeFileSync(WALLETS_FILE, JSON.stringify(wallets, null, 2));
    console.log(`✅ ${wallets.length} wallets saved to generated-wallets.json`);
  }

  // 2) ESTIMATE GAS COST PER PING
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || 25000000000n;
  const gasPerPing = BigInt(PING_GAS) * gasPrice;
  const buffer = gasPerPing + hre.ethers.parseEther("0.001"); // extra safety
  console.log(`\n⛽ Gas per ping: ${hre.ethers.formatEther(gasPerPing)} CELO`);
  console.log(`⛽ Fund amount:  ${hre.ethers.formatEther(buffer)} CELO per wallet`);

  let totalGasUsed = 0n;
  let totalCost = 0n;
  let successfulPings = 0;
  let failedPings = 0;

  // 3) FUND + PING LOOP
  for (let i = 0; i < wallets.length; i++) {
    const w = wallets[i];
    const walletSigner = new hre.ethers.Wallet(w.privateKey, provider);

    // Check main balance
    const mainBal = await provider.getBalance(mainWallet.address);
    if (mainBal < MIN_BALANCE) {
      console.log(`\n⚠️  Main wallet low (${hre.ethers.formatEther(mainBal)} CELO). Stopping.`);
      break;
    }

    // Check wallet balance
    const wb = await provider.getBalance(w.address);
    if (wb < buffer) {
      // Fund wallet
      try {
        const fundTx = await mainWallet.sendTransaction({
          to: w.address,
          value: buffer,
        });
        await fundTx.wait();
      } catch (e) {
        console.log(`[${i + 1}/${wallets.length}] ❌ Fund failed: ${e.message.slice(0, 60)}`);
        failedPings++;
        continue;
      }
    }

    // Ping from wallet
    try {
      const pingTx = await contract.connect(walletSigner).ping({
        gasLimit: PING_GAS,
      });
      const receipt = await pingTx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      totalGasUsed += receipt.gasUsed;
      totalCost += gasCost;
      successfulPings++;

      if ((i + 1) % PROGRESS_INTERVAL === 0) {
        console.log(`[${i + 1}/${wallets.length}] ✅ Pinged! Gas: ${receipt.gasUsed} | Cost: ${hre.ethers.formatEther(gasCost)} CELO`);
      }
    } catch (e) {
      console.log(`[${i + 1}/${wallets.length}] ❌ Ping failed: ${e.message.slice(0, 60)}`);
      failedPings++;
    }
  }

  // 4) SUMMARY
  const endBalance = await provider.getBalance(mainWallet.address);
  console.log("\n========== FINAL SUMMARY ==========");
  console.log(`Wallets processed:  ${successfulPings + failedPings}/${wallets.length}`);
  console.log(`Successful pings:   ${successfulPings}`);
  console.log(`Failed pings:       ${failedPings}`);
  console.log(`Total gas used:     ${totalGasUsed}`);
  console.log(`Total cost:         ${hre.ethers.formatEther(totalCost)} CELO`);
  if (successfulPings > 0) console.log(`Avg cost per ping:  ${hre.ethers.formatEther(totalCost / BigInt(successfulPings))} CELO`);
  console.log(`Main wallet remaining: ${hre.ethers.formatEther(endBalance)} CELO`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
