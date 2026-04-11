const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying AgroShield contracts to Celo Alfajores testnet...");

  // cUSD token address on Celo Alfajores testnet
  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "CELO");

  // Deploy AgroShieldPool
  console.log("\n1. Deploying AgroShieldPool...");
  const AgroShieldPool = await ethers.getContractFactory("AgroShieldPool");
  const agroShieldPool = await AgroShieldPool.deploy(CUSD_ADDRESS);
  await agroShieldPool.waitForDeployment();
  const poolAddress = await agroShieldPool.getAddress();
  console.log("AgroShieldPool deployed to:", poolAddress);

  // Deploy AgroShieldOracle
  console.log("\n2. Deploying AgroShieldOracle...");
  const AgroShieldOracle = await ethers.getContractFactory("AgroShieldOracle");
  const agroShieldOracle = await AgroShieldOracle.deploy();
  await agroShieldOracle.waitForDeployment();
  const oracleAddress = await agroShieldOracle.getAddress();
  console.log("AgroShieldOracle deployed to:", oracleAddress);

  // Deploy AgroShieldPolicy
  console.log("\n3. Deploying AgroShieldPolicy...");
  const AgroShieldPolicy = await ethers.getContractFactory("AgroShieldPolicy");
  const agroShieldPolicy = await AgroShieldPolicy.deploy(CUSD_ADDRESS, poolAddress);
  await agroShieldPolicy.waitForDeployment();
  const policyAddress = await agroShieldPolicy.getAddress();
  console.log("AgroShieldPolicy deployed to:", policyAddress);

  // Setup contract relationships
  console.log("\n4. Setting up contract relationships...");

  // Authorize Policy contract in Pool
  console.log("Authorizing Policy contract in Pool...");
  await agroShieldPool.authorizePolicy(policyAddress);
  console.log("Policy contract authorized in Pool");

  // Set Oracle contract in Policy
  console.log("Setting Oracle contract in Policy...");
  await agroShieldPolicy.setOracleContract(oracleAddress);
  console.log("Oracle contract set in Policy");

  // Set Policy contract in Oracle
  console.log("Setting Policy contract in Oracle...");
  await agroShieldOracle.setPolicyContract(policyAddress);
  console.log("Policy contract set in Oracle");

  // Authorize deployer as weather data provider (for testing)
  console.log("Authorizing deployer as weather data provider...");
  await agroShieldOracle.authorizeProvider(deployer.address);
  console.log("Deployer authorized as weather data provider");

  // Display deployment summary
  console.log("\n=== Deployment Summary ===");
  console.log("Network: Celo Alfajores Testnet");
  console.log("cUSD Token:", CUSD_ADDRESS);
  console.log("AgroShieldPool:", poolAddress);
  console.log("AgroShieldPolicy:", policyAddress);
  console.log("AgroShieldOracle:", oracleAddress);
  console.log("Deployer:", deployer.address);

  // Verify contract setup
  console.log("\n=== Verification ===");
  const authorizedPolicy = await agroShieldPool.authorizedPolicies(policyAddress);
  console.log("Policy authorized in Pool:", authorizedPolicy);

  const oracleInPolicy = await agroShieldPolicy.oracleContract();
  console.log("Oracle in Policy:", oracleInPolicy);

  const policyInOracle = await agroShieldOracle.policyContract();
  console.log("Policy in Oracle:", policyInOracle);

  const authorizedProvider = await agroShieldOracle.authorizedProviders(deployer.address);
  console.log("Deployer authorized as provider:", authorizedProvider);

  console.log("\n=== Deployment Complete ===");
  console.log("Contracts are ready for use!");
  console.log("\nNext steps:");
  console.log("1. Fund the pool with cUSD liquidity");
  console.log("2. Farmers can create and activate policies");
  console.log("3. Weather data providers can submit rainfall data");
  console.log("4. Automatic payouts will trigger when thresholds are breached");

  // Save deployment addresses to a file for easy access
  const deploymentInfo = {
    network: "celo-alfajores",
    deployedAt: new Date().toISOString(),
    contracts: {
      cusdToken: CUSD_ADDRESS,
      agroShieldPool: poolAddress,
      agroShieldPolicy: policyAddress,
      agroShieldOracle: oracleAddress
    },
    deployer: deployer.address
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
