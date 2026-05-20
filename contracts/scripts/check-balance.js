const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const address = signer.address;
  const balance = await hre.ethers.provider.getBalance(address);
  console.log("Address:", address);
  console.log("Balance:", hre.ethers.formatEther(balance), "CELO");
}

main();
