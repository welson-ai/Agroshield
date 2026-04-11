import { ethers } from "ethers";
import fs from "fs";

async function main() {
  console.log("🏊 Deploying AgroShieldPool to Celo Alfajores testnet...");

  // cUSD token address on Celo Alfajores testnet
  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  
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

  // Deploy AgroShieldPool
  console.log("\n🚀 Deploying AgroShieldPool...");
  const AgroShieldPoolArtifact = require("../artifacts/contracts/AgroShieldPool.sol/AgroShieldPool.json");
  const agroShieldPool = new ethers.ContractFactory(
    AgroShieldPoolArtifact.abi,
    AgroShieldPoolArtifact.bytecode,
    deployer
  );
  const agroShieldPoolContract = await agroShieldPool.deploy(CUSD_ADDRESS);
  await agroShieldPoolContract.waitForDeployment();
  const poolAddress = await agroShieldPoolContract.getAddress();
  
  console.log("✅ AgroShieldPool deployed to:", poolAddress);
  console.log("🔗 CeloScan: https://alfajores.celoscan.io/address/" + poolAddress);

  // Save deployment info
  const deploymentInfo = {
    contract: "AgroShieldPool",
    address: poolAddress,
    network: "celo-alfajores",
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    cusdToken: CUSD_ADDRESS
  };

  fs.writeFileSync(
    "deployment-pool.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to deployment-pool.json");

  console.log("\n🎯 Next: Deploy AgroShieldOracle");
  console.log("💡 Command: npx hardhat run scripts/deploy-oracle.js --network alfajores");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
