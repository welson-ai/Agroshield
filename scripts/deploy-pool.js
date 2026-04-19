import { createWalletClient, http, createPublicClient, formatEther } from "viem";
import { celo } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";

async function main() {
  console.log("Deploying AgroShieldPool to Celo mainnet...");

  const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

  let PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    console.error("PRIVATE_KEY not found in .env file");
    process.exit(1);
  }

  // Ensure 0x prefix — no TypeScript casting needed
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

  const artifact = JSON.parse(fs.readFileSync("./artifacts/contracts/AgroShieldPool.sol/AgroShieldPool.json", "utf8"));

  console.log("\nDeploying AgroShieldPool...");
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [CUSD_ADDRESS],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const poolAddress = receipt.contractAddress;

  if (!poolAddress) {
    console.error("Deployment failed - no contract address in receipt");
    process.exit(1);
  }

  console.log("✅ AgroShieldPool deployed to:", poolAddress);
  console.log("CeloScan: https://celoscan.io/address/" + poolAddress);

  const deploymentInfo = {
    contract: "AgroShieldPool",
    address: poolAddress,
    network: "celo",
    deployedAt: new Date().toISOString(),
    deployer: account.address,
    cusdToken: CUSD_ADDRESS
  };

  fs.writeFileSync("deployment-pool.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to deployment-pool.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });