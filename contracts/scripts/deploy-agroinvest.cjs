const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying AgroInvest to Celo Mainnet...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "CELO");

  // Deploy AgroInvest
  console.log("\n🔨 Deploying AgroInvest...");
  const AgroInvest = await hre.ethers.getContractFactory("AgroInvest");
  const agroInvest = await AgroInvest.deploy();
  
  await agroInvest.waitForDeployment();
  const address = await agroInvest.getAddress();
  
  console.log("\n✅ AGROINVEST DEPLOYED!");
  console.log("📍 Contract Address:", address);
  console.log("🔗 Explorer:", `https://celoscan.io/address/${address}`);

  // Verify contract
  console.log("\n📝 Verifying contract on CeloScan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified!");
  } catch (error) {
    console.log("⚠️ Verification failed:", error.message.split('\n')[0]);
  }

  console.log("\n🎊 DEPLOYMENT COMPLETE!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
