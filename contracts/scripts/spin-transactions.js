const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const contractAddress = "0x74bFd5b1392a5588E7d9d2e6d741838F529070C2";
  
  // Minimal ABI for recordYield (cheapest state-changing function)
  const abi = [
    "function recordYield(uint256 amount) external",
    "function totalYieldEarned() view returns (uint256)"
  ];
  
  const contract = new hre.ethers.Contract(contractAddress, abi, signer);
  
  const NUM_TXS = parseInt(process.env.NUM_TXS) || 100;
  const INTERVAL_MS = parseInt(process.env.INTERVAL_MS) || 3000; // 3 seconds default
  
  console.log("🚀 Starting transaction spinner...");
  console.log(`   Contract: ${contractAddress}`);
  console.log(`   Transactions: ${NUM_TXS}`);
  console.log(`   Interval: ${INTERVAL_MS}ms`);
  console.log(`   Press Ctrl+C to stop\n`);

  const startBalance = await hre.ethers.provider.getBalance(signer.address);
  console.log(`Starting balance: ${hre.ethers.formatEther(startBalance)} CELO\n`);

  let totalGasUsed = 0n;
  let totalCost = 0n;

  let nonce = await signer.getNonce();
  
  for (let i = 1; i <= NUM_TXS; i++) {
    try {
      // Record a small yield amount (uses minimal gas)
      const tx = await contract.recordYield(i, {
        gasLimit: 50000,
        nonce: nonce,
      });
      
      nonce++; // Increment for next tx
      
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      
      totalGasUsed += receipt.gasUsed;
      totalCost += gasCost;
      
      console.log(`[${i}/${NUM_TXS}] ✅ tx: ${tx.hash.slice(0, 18)}... | gas: ${receipt.gasUsed} | cost: ${hre.ethers.formatEther(gasCost)} CELO`);
      
      // Wait before next tx
      if (i < NUM_TXS) {
        await new Promise(r => setTimeout(r, INTERVAL_MS));
      }
    } catch (error) {
      console.log(`[${i}/${NUM_TXS}] ❌ Failed: ${error.message}`);
      // Re-fetch nonce on error
      nonce = await signer.getNonce();
    }
  }

  const endBalance = await hre.ethers.provider.getBalance(signer.address);
  
  console.log("\n--- Summary ---");
  console.log(`Total transactions: ${NUM_TXS}`);
  console.log(`Total gas used: ${totalGasUsed}`);
  console.log(`Total cost: ${hre.ethers.formatEther(totalCost)} CELO`);
  console.log(`Avg cost per tx: ${hre.ethers.formatEther(totalCost / BigInt(NUM_TXS))} CELO`);
  console.log(`Remaining balance: ${hre.ethers.formatEther(endBalance)} CELO`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
