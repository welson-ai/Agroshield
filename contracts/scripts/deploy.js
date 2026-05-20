const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "CELO");

  // Celo Mainnet token addresses
  const TOKENS = {
    42220: {
      cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    },
  };

  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  const tokens = TOKENS[chainId];

  if (!tokens) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  // Deploy with cUSD as deposit token
  const depositToken = tokens.cUSD;
  const aiAgent = deployer.address; // Initially set deployer as AI agent

  console.log("\nDeploying Solmate...");
  console.log("- Deposit Token (cUSD):", depositToken);
  console.log("- AI Agent:", aiAgent);

  const Solmate = await hre.ethers.getContractFactory("Solmate");
  const solmate = await Solmate.deploy(depositToken, aiAgent);
  await solmate.waitForDeployment();

  const address = await solmate.getAddress();
  console.log("\n✅ Solmate deployed to:", address);

  // Wait for confirmations before verifying
  console.log("\nWaiting for confirmations...");
  await solmate.deploymentTransaction().wait(5);

  // Verify on Celoscan
  console.log("\nVerifying on Celoscan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [depositToken, aiAgent],
    });
    console.log("✅ Contract verified!");
  } catch (error) {
    console.log("Verification failed:", error.message);
  }

  console.log("\n--- Deployment Summary ---");
  console.log("Network: Celo Mainnet");
  console.log("Contract:", address);
  console.log("Deposit Token:", depositToken);
  console.log("AI Agent:", aiAgent);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
