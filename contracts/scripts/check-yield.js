const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(
    "0xa321f7217190C33262Acd6464981D3C44b8C5980",
    ["function totalYieldEarned() view returns (uint256)"],
    signer
  );
  const total = await contract.totalYieldEarned();
  console.log("Total yield recorded (approx tx count):", total.toString());
}

main().then(() => process.exit(0)).catch(console.error);
