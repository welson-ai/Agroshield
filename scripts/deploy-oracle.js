import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  console.log("🌤️ Deploying AgroShieldOracle to Celo Alfajores testnet...");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "CELO");

  // Deploy AgroShieldOracle
  console.log("\n🚀 Deploying AgroShieldOracle...");
  const AgroShieldOracle = await ethers.getContractFactory("AgroShieldOracle");
  const agroShieldOracle = await AgroShieldOracle.deploy();
  await agroShieldOracle.waitForDeployment();
  const oracleAddress = await agroShieldOracle.getAddress();
  
  console.log("✅ AgroShieldOracle deployed to:", oracleAddress);
  console.log("🔗 CeloScan: https://alfajores.celoscan.io/address/" + oracleAddress);

  // Save deployment info
  const deploymentInfo = {
    contract: "AgroShieldOracle",
    address: oracleAddress,
    network: "celo-alfajores",
    deployedAt: new Date().toISOString(),
    deployer: deployer.address
  };

  fs.writeFileSync(
    "deployment-oracle.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to deployment-oracle.json");

  console.log("\n🎯 Next: Deploy AgroShieldPolicy");
  console.log("💡 Command: npx hardhat run scripts/deploy-policy.js --network alfajores");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
