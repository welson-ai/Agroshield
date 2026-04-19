import { createWalletClient, createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("🚀 Deploying AgroShieldPool to Celo mainnet...");

  const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

  let PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) { console.error("No PRIVATE_KEY"); process.exit(1); }
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

  const artifact = JSON.parse(fs.readFileSync(
    "./artifacts/contracts/AgroShieldPool.sol/AgroShieldPool.json", "utf8"
  ));

  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [CUSD_ADDRESS],
  });

  console.log("⏳ Waiting for confirmation...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  console.log("✅ Deployed to:", receipt.contractAddress);
  console.log("🔗 https://celoscan.io/address/" + receipt.contractAddress);

  fs.writeFileSync("deployment-pool-simple.json", JSON.stringify({
    contract: "AgroShieldPool",
    address: receipt.contractAddress,
    network: "celo-mainnet",
    deployedAt: new Date().toISOString(),
    deployer: account.address,
    cusdToken: CUSD_ADDRESS
  }, null, 2));

  console.log("📄 Saved to deployment-pool-simple.json");
  console.log("🎊 Ready for transaction spinning!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error("❌", e); process.exit(1); });
