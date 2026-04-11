import { ethers } from "ethers";
import fs from "fs";

async function main() {
  console.log("🌤️ Deploying AgroShieldOracle to Celo Alfajores testnet...");
  
  // Get private key from environment
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not found in .env file");
    process.exit(1);
  }
  
  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider("https://alfajores-forno.celo-testnet.org");
  const deployer = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await provider.getBalance(deployer.address)), "CELO");

  // Deploy AgroShieldOracle
  console.log("\n🚀 Deploying AgroShieldOracle...");
  const AgroShieldOracleArtifact = require("../artifacts/contracts/AgroShieldOracle.sol/AgroShieldOracle.json");
  const agroShieldOracle = new ethers.ContractFactory(
    AgroShieldOracleArtifact.abi,
    AgroShieldOracleArtifact.bytecode,
    deployer
  );
  const agroShieldOracleContract = await agroShieldOracle.deploy();
  await agroShieldOracleContract.waitForDeployment();
  const oracleAddress = await agroShieldOracleContract.getAddress();
  
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
