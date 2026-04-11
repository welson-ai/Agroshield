import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("Deploying AgroShieldPool to Celo Sepolia testnet...");

  // cUSD token address on Celo Sepolia testnet
  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  // Get deployer account
  const [deployer] = await hre.viem.getWalletClients();
  console.log("👤 Deployer:", deployer.account.address);

  const publicClient = await hre.viem.getPublicClient();
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("💰 Balance:", balance.toString(), "wei");

  // Deploy AgroShieldPool
  console.log("\nDeploying AgroShieldPool...");
  const agroShieldPool = await hre.viem.deployContract("AgroShieldPool", [CUSD_ADDRESS]);

  console.log("✅ AgroShieldPool deployed to:", agroShieldPool.address);
  console.log("CeloScan: https://celo-sepolia.celoscan.io/address/" + agroShieldPool.address);

  // Save deployment info
  const deploymentInfo = {
    contract: "AgroShieldPool",
    address: agroShieldPool.address,
    network: "celo-sepolia",
    deployedAt: new Date().toISOString(),
    deployer: deployer.account.address,
    cusdToken: CUSD_ADDRESS
  };

  fs.writeFileSync(
    "deployment-pool.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to deployment-pool.json");

  console.log("\n🎯 Next: Deploy AgroShieldOracle");
  console.log("💡 Command: npx hardhat run scripts/deploy-oracle.js --network celo-sepolia");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });