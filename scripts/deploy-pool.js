import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("Deploying AgroShieldPool to Celo Sepolia testnet...");

  // cUSD token address on Celo Sepolia testnet
  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  
  // Get ethers from hardhat runtime environment
  const { ethers } = hre;
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "CELO");

  // Deploy AgroShieldPool
  console.log("\nDeploying AgroShieldPool...");
  const AgroShieldPool = await ethers.getContractFactory("AgroShieldPool");
  const agroShieldPoolContract = await AgroShieldPool.deploy(CUSD_ADDRESS);
  await agroShieldPoolContract.waitForDeployment();
  const poolAddress = await agroShieldPoolContract.getAddress();
  
  console.log("✅ AgroShieldPool deployed to:", poolAddress);
  console.log("CeloScan: https://celo-sepolia.celoscan.io/address/" + poolAddress);

  // Save deployment info
  const deploymentInfo = {
    contract: "AgroShieldPool",
    address: poolAddress,
    network: "celo-sepolia",
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
