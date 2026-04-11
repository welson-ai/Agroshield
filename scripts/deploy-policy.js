import { createWalletClient, http, createPublicClient, formatEther } from "viem";
import { celo } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";

async function main() {
  console.log("Deploying AgroShieldPolicy to Celo mainnet...");

  // cUSD token address on Celo mainnet
  const CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  let PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    console.error("PRIVATE_KEY not found in .env file");
    process.exit(1);
  }

  // Ensure 0x prefix
  if (!PRIVATE_KEY.startsWith("0x")) PRIVATE_KEY = "0x" + PRIVATE_KEY;

  const account = privateKeyToAccount(PRIVATE_KEY);
  
  const publicClient = createPublicClient({
    chain: celo,
    transport: http("https://forno.celo.org"),
  });

  const walletClient = createWalletClient({
    account,
    chain: celo,
    transport: http("https://forno.celo.org"),
  });

  console.log("Deployer:", account.address);
  const balance = await publicClient.getBalance({ address: account.address });
  console.log("Balance:", formatEther(balance), "CELO");

  // Read previous deployment addresses
  let poolAddress, oracleAddress;
  
  try {
    const poolDeployment = JSON.parse(fs.readFileSync("deployment-pool.json", "utf8"));
    poolAddress = poolDeployment.address;
    console.log("Using AgroShieldPool:", poolAddress);
  } catch (error) {
    console.log("Please deploy AgroShieldPool first");
    console.log("Command: npx hardhat run scripts/deploy-pool.js --network celo");
    process.exit(1);
  }

  try {
    const oracleDeployment = JSON.parse(fs.readFileSync("deployment-oracle.json", "utf8"));
    oracleAddress = oracleDeployment.address;
    console.log("Using AgroShieldOracle:", oracleAddress);
  } catch (error) {
    console.log("Please deploy AgroShieldOracle first");
    console.log("Command: npx hardhat run scripts/deploy-oracle.js --network celo");
    process.exit(1);
  }

  // Read contract bytecode and ABI
  const policyArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/AgroShieldPolicy.sol/AgroShieldPolicy.json", "utf8"));
  const poolArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/AgroShieldPool.sol/AgroShieldPool.json", "utf8"));
  const oracleArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/AgroShieldOracle.sol/AgroShieldOracle.json", "utf8"));

  // Deploy AgroShieldPolicy
  console.log("\nDeploying AgroShieldPolicy...");
  const hash = await walletClient.deployContract({
    abi: policyArtifact.abi,
    bytecode: policyArtifact.bytecode,
    args: [CUSD_ADDRESS, poolAddress],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const policyAddress = receipt.contractAddress;

  if (!policyAddress) {
    console.error("Deployment failed - no contract address in receipt");
    process.exit(1);
  }
  
  console.log("AgroShieldPolicy deployed to:", policyAddress);
  console.log("CeloScan: https://celoscan.io/address/" + policyAddress);

  // Setup contract relationships
  console.log("\nSetting up contract relationships...");
  
  // Authorize Policy contract in Pool
  console.log("Authorizing Policy in Pool...");
  const poolAuthHash = await walletClient.writeContract({
    address: poolAddress,
    abi: poolArtifact.abi,
    functionName: 'authorizePolicy',
    args: [policyAddress],
  });
  await publicClient.waitForTransactionReceipt({ hash: poolAuthHash });
  console.log("Policy authorized in Pool");

  // Set Oracle contract in Policy
  console.log("Setting Oracle in Policy...");
  const policyOracleHash = await walletClient.writeContract({
    address: policyAddress,
    abi: policyArtifact.abi,
    functionName: 'setOracleContract',
    args: [oracleAddress],
  });
  await publicClient.waitForTransactionReceipt({ hash: policyOracleHash });
  console.log("Oracle set in Policy");

  // Set Policy contract in Oracle
  console.log("Setting Policy in Oracle...");
  const oraclePolicyHash = await walletClient.writeContract({
    address: oracleAddress,
    abi: oracleArtifact.abi,
    functionName: 'setPolicyContract',
    args: [policyAddress],
  });
  await publicClient.waitForTransactionReceipt({ hash: oraclePolicyHash });
  console.log("Policy set in Oracle");

  // Authorize deployer as weather data provider
  console.log("Authorizing deployer as weather provider...");
  const providerAuthHash = await walletClient.writeContract({
    address: oracleAddress,
    abi: oracleArtifact.abi,
    functionName: 'authorizeProvider',
    args: [account.address],
  });
  await publicClient.waitForTransactionReceipt({ hash: providerAuthHash });
  console.log("Deployer authorized as weather provider");

  // Save deployment info
  const deploymentInfo = {
    contract: "AgroShieldPolicy",
    address: policyAddress,
    network: "celo",
    deployedAt: new Date().toISOString(),
    deployer: account.address,
    cusdToken: CUSD_ADDRESS,
    poolContract: poolAddress,
    oracleContract: oracleAddress
  };

  fs.writeFileSync(
    "deployment-policy.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info saved to deployment-policy.json");

  // Create combined deployment file
  const combinedDeployment = {
    network: "celo",
    deployedAt: new Date().toISOString(),
    contracts: {
      cusdToken: CUSD_ADDRESS,
      agroShieldPool: poolAddress,
      agroShieldOracle: oracleAddress,
      agroShieldPolicy: policyAddress
    },
    deployer: account.address
  };

  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(combinedDeployment, null, 2)
  );
  console.log("Combined deployment info saved to deployment.json");

  console.log("\nAll contracts deployed and configured!");
  console.log("Pool: https://celoscan.io/address/" + poolAddress);
  console.log("Oracle: https://celoscan.io/address/" + oracleAddress);
  console.log("Policy: https://celoscan.io/address/" + policyAddress);

  console.log("\nVerification Commands:");
  console.log("npx hardhat verify --network celo " + poolAddress + ' "' + CUSD_ADDRESS + '"');
  console.log("npx hardhat verify --network celo " + oracleAddress);
  console.log("npx hardhat verify --network celo " + policyAddress + ' "' + CUSD_ADDRESS + '" "' + poolAddress + '"');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
