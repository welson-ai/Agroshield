import { ethers } from "ethers";
import fs from "fs";

async function main() {
  console.log("📋 Deploying AgroShieldPolicy to Celo Alfajores testnet...");

  // cUSD token address on Celo Alfajores testnet
  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  
  // Get private key from environment
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not found in .env file");
    process.exit(1);
  }
  
  // Setup provider and wallet using Hardhat config
  const provider = new ethers.JsonRpcProvider("https://alfajores-forno.celo-testnet.org");
  const deployer = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await provider.getBalance(deployer.address)), "CELO");

  // Read previous deployment addresses
  let poolAddress, oracleAddress;
  
  try {
    const poolDeployment = JSON.parse(fs.readFileSync("deployment-pool.json", "utf8"));
    poolAddress = poolDeployment.address;
    console.log("🏊 Using AgroShieldPool:", poolAddress);
  } catch (error) {
    console.log("⚠️  Please deploy AgroShieldPool first");
    console.log("💡 Command: npx hardhat run scripts/deploy-pool.js --network alfajores");
    process.exit(1);
  }

  try {
    const oracleDeployment = JSON.parse(fs.readFileSync("deployment-oracle.json", "utf8"));
    oracleAddress = oracleDeployment.address;
    console.log("🌤️ Using AgroShieldOracle:", oracleAddress);
  } catch (error) {
    console.log("⚠️  Please deploy AgroShieldOracle first");
    console.log("💡 Command: npx hardhat run scripts/deploy-oracle.js --network alfajores");
    process.exit(1);
  }

  // Deploy AgroShieldPolicy
  console.log("\n🚀 Deploying AgroShieldPolicy...");
  const AgroShieldPolicyArtifact = require("../artifacts/contracts/AgroShieldPolicy.sol/AgroShieldPolicy.json");
  const agroShieldPolicy = new ethers.ContractFactory(
    AgroShieldPolicyArtifact.abi,
    AgroShieldPolicyArtifact.bytecode,
    deployer
  );
  const agroShieldPolicyContract = await agroShieldPolicy.deploy(CUSD_ADDRESS, poolAddress);
  await agroShieldPolicyContract.waitForDeployment();
  const policyAddress = await agroShieldPolicyContract.getAddress();
  
  console.log("✅ AgroShieldPolicy deployed to:", policyAddress);
  console.log("🔗 CeloScan: https://alfajores.celoscan.io/address/" + policyAddress);

  // Setup contract relationships
  console.log("\n🔗 Setting up contract relationships...");
  
  // Authorize Policy contract in Pool
  console.log("🏊 Authorizing Policy in Pool...");
  const AgroShieldPool = await ethers.getContractFactory("AgroShieldPool");
  const poolContract = AgroShieldPool.attach(poolAddress);
  await poolContract.authorizePolicy(policyAddress);
  console.log("✅ Policy authorized in Pool");

  // Set Oracle contract in Policy
  console.log("📋 Setting Oracle in Policy...");
  await agroShieldPolicy.setOracleContract(oracleAddress);
  console.log("✅ Oracle set in Policy");

  // Set Policy contract in Oracle
  console.log("🌤️ Setting Policy in Oracle...");
  const AgroShieldOracle = await ethers.getContractFactory("AgroShieldOracle");
  const oracleContract = AgroShieldOracle.attach(oracleAddress);
  await oracleContract.setPolicyContract(policyAddress);
  console.log("✅ Policy set in Oracle");

  // Authorize deployer as weather data provider
  console.log("👤 Authorizing deployer as weather provider...");
  await oracleContract.authorizeProvider(deployer.address);
  console.log("✅ Deployer authorized as weather provider");

  // Save deployment info
  const deploymentInfo = {
    contract: "AgroShieldPolicy",
    address: policyAddress,
    network: "celo-alfajores",
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    cusdToken: CUSD_ADDRESS,
    poolContract: poolAddress,
    oracleContract: oracleAddress
  };

  fs.writeFileSync(
    "deployment-policy.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to deployment-policy.json");

  // Create combined deployment file
  const combinedDeployment = {
    network: "celo-alfajores",
    deployedAt: new Date().toISOString(),
    contracts: {
      cusdToken: CUSD_ADDRESS,
      agroShieldPool: poolAddress,
      agroShieldOracle: oracleAddress,
      agroShieldPolicy: policyAddress
    },
    deployer: deployer.address
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(combinedDeployment, null, 2)
  );
  console.log("📄 Combined deployment info saved to deployment.json");

  console.log("\n🎉 All contracts deployed and configured!");
  console.log("🔗 Pool: https://alfajores.celoscan.io/address/" + poolAddress);
  console.log("🔗 Oracle: https://alfajores.celoscan.io/address/" + oracleAddress);
  console.log("🔗 Policy: https://alfajores.celoscan.io/address/" + policyAddress);

  console.log("\n📋 Verification Commands:");
  console.log("npx hardhat verify --network alfajores " + poolAddress + ' "' + CUSD_ADDRESS + '"');
  console.log("npx hardhat verify --network alfajores " + oracleAddress);
  console.log("npx hardhat verify --network alfajores " + policyAddress + ' "' + CUSD_ADDRESS + '" "' + poolAddress + '"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
