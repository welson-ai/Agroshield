import { ethers } from "ethers";
import fs from "fs";

async function main() {
  console.log("Deploying AgroShield contracts to Celo Alfajores testnet...");

  // cUSD token address on Celo Alfajores testnet
  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  
  // Get the deployer account using ethers directly
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
  console.log("Deploying contracts with the account:", deployer.address);
  
  const balance = await provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "CELO");

  // Deploy AgroShieldPool
  console.log("\n1. Deploying AgroShieldPool...");
  const AgroShieldPoolArtifact = require("../artifacts/contracts/AgroShieldPool.sol/AgroShieldPool.json");
  const agroShieldPool = new ethers.ContractFactory(
    AgroShieldPoolArtifact.abi,
    AgroShieldPoolArtifact.bytecode,
    deployer
  );
  const agroShieldPoolContract = await agroShieldPool.deploy(CUSD_ADDRESS);
  await agroShieldPoolContract.waitForDeployment();
  const poolAddress = await agroShieldPoolContract.getAddress();
  console.log("AgroShieldPool deployed to:", poolAddress);

  // Deploy AgroShieldOracle
  console.log("\n2. Deploying AgroShieldOracle...");
  const AgroShieldOracleArtifact = require("../artifacts/contracts/AgroShieldOracle.sol/AgroShieldOracle.json");
  const agroShieldOracle = new ethers.ContractFactory(
    AgroShieldOracleArtifact.abi,
    AgroShieldOracleArtifact.bytecode,
    deployer
  );
  const agroShieldOracleContract = await agroShieldOracle.deploy();
  await agroShieldOracleContract.waitForDeployment();
  const oracleAddress = await agroShieldOracleContract.getAddress();
  console.log("AgroShieldOracle deployed to:", oracleAddress);

  // Deploy AgroShieldPolicy
  console.log("\n3. Deploying AgroShieldPolicy...");
  const AgroShieldPolicyArtifact = require("../artifacts/contracts/AgroShieldPolicy.sol/AgroShieldPolicy.json");
  const agroShieldPolicy = new ethers.ContractFactory(
    AgroShieldPolicyArtifact.abi,
    AgroShieldPolicyArtifact.bytecode,
    deployer
  );
  const agroShieldPolicyContract = await agroShieldPolicy.deploy(CUSD_ADDRESS, poolAddress);
  await agroShieldPolicyContract.waitForDeployment();
  const policyAddress = await agroShieldPolicyContract.getAddress();
  console.log("AgroShieldPolicy deployed to:", policyAddress);

  // Setup contract relationships
  console.log("\n4. Setting up contract relationships...");

  // Authorize Policy contract in Pool
  console.log("Authorizing Policy contract in Pool...");
  await agroShieldPoolContract.authorizePolicy(policyAddress);
  console.log("Policy contract authorized in Pool");

  // Set Oracle contract in Policy
  console.log("Setting Oracle contract in Policy...");
  await agroShieldPolicyContract.setOracleContract(oracleAddress);
  console.log("Oracle contract set in Policy");

  // Set Policy contract in Oracle
  console.log("Setting Policy contract in Oracle...");
  await agroShieldOracleContract.setPolicyContract(policyAddress);
  console.log("Policy contract set in Oracle");

  // Authorize deployer as weather data provider (for testing)
  console.log("Authorizing deployer as weather data provider...");
  await agroShieldOracleContract.authorizeProvider(deployer.address);
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
  const authorizedPolicy = await agroShieldPoolContract.authorizedPolicies(policyAddress);
  console.log("Policy authorized in Pool:", authorizedPolicy);

  const oracleInPolicy = await agroShieldPolicyContract.oracleContract();
  console.log("Oracle in Policy:", oracleInPolicy);

  const policyInOracle = await agroShieldOracleContract.policyContract();
  console.log("Policy in Oracle:", policyInOracle);

  const authorizedProvider = await agroShieldOracleContract.authorizedProviders(deployer.address);
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
