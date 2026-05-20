const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Solmate Contract to Celo Mainnet...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "CELO");

  // cUSD token address on Celo Mainnet
  const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  
  // AI Agent address (deployer for now, can be updated later)
  const AI_AGENT = deployer.address;

  console.log("\n📋 Constructor Parameters:");
  console.log("   💵 Deposit Token (cUSD):", CUSD_ADDRESS);
  console.log("   🤖 AI Agent:", AI_AGENT);

  // Deploy Solmate
  console.log("\n🔨 Deploying Solmate...");
  const Solmate = await hre.ethers.getContractFactory("Solmate");
  const solmate = await Solmate.deploy(CUSD_ADDRESS, AI_AGENT);
  
  await solmate.waitForDeployment();
  const address = await solmate.getAddress();
  
  console.log("\n✅ SOLMATE DEPLOYED!");
  console.log("📍 Contract Address:", address);
  console.log("🔗 Explorer:", `https://celoscan.io/address/${address}`);

  // Verify contract
  console.log("\n📝 Verifying contract on CeloScan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [CUSD_ADDRESS, AI_AGENT],
    });
    console.log("✅ Contract verified!");
  } catch (error) {
    console.log("⚠️ Verification failed:", error.message);
  }

  console.log("\n🎊 DEPLOYMENT COMPLETE!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
