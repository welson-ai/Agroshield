import { createWalletClient, http, createPublicClient, formatEther } from "viem";
import { celo } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";

async function main() {
  console.log("Deploying AgroShieldOracle to Celo mainnet...");

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

  console.log("👤 Deployer:", account.address);
  const balance = await publicClient.getBalance({ address: account.address });
  console.log("💰 Balance:", formatEther(balance), "CELO");

  // Read contract bytecode and ABI
  const artifact = JSON.parse(fs.readFileSync("./artifacts/contracts/AgroShieldOracle.sol/AgroShieldOracle.json", "utf8"));
  
  console.log("\n🚀 Deploying AgroShieldOracle...");
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const oracleAddress = receipt.contractAddress;

  if (!oracleAddress) {
    console.error("Deployment failed - no contract address in receipt");
    process.exit(1);
  }

  console.log("✅ AgroShieldOracle deployed to:", oracleAddress);
  console.log("CeloScan: https://celoscan.io/address/" + oracleAddress);

  const deploymentInfo = {
    contract: "AgroShieldOracle",
    address: oracleAddress,
    network: "celo",
    deployedAt: new Date().toISOString(),
    deployer: account.address
  };

  fs.writeFileSync(
    "deployment-oracle.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info saved to deployment-oracle.json");

  console.log("\nNext: Deploy AgroShieldPolicy");
  console.log("Command: npx hardhat run scripts/deploy-policy.js --network celo");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
