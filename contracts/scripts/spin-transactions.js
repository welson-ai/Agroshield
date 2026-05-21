const hre = require("hardhat");
 
async function main() {
  const [signer] = await hre.ethers.getSigners();
  const contractAddress = "0xa321f7217190C33262Acd6464981D3C44b8C5980";
  
  const abi = [
    "function recordYield(uint256 amount) external",
    "function totalYieldEarned() view returns (uint256)"
  ];
  
  const contract = new hre.ethers.Contract(contractAddress, abi, signer);
  
  const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 100;
  const TOTAL_TXS = parseInt(process.env.TOTAL_TXS) || 100;
  const INTERVAL_MS = parseInt(process.env.INTERVAL_MS) || 1000;
  const MIN_BALANCE = hre.ethers.parseEther(process.env.MIN_BALANCE || "0.1");
  
  console.log("🚀 Starting transaction spinner...");
  console.log(`   Contract: ${contractAddress}`);
  console.log(`   Batch size: ${BATCH_SIZE}`);
  console.log(`   Total target: ${TOTAL_TXS === 0 ? 'Until depleted' : TOTAL_TXS}`);
  console.log(`   Interval: ${INTERVAL_MS}ms`);
  console.log(`   Min balance: ${hre.ethers.formatEther(MIN_BALANCE)} CELO`);
  console.log(`   Press Ctrl+C to stop\n`);
 
  const startBalance = await hre.ethers.provider.getBalance(signer.address);
  console.log(`Starting balance: ${hre.ethers.formatEther(startBalance)} CELO\n`);
 
  let totalGasUsed = 0n;
  let totalCost = 0n;
  let totalCompleted = 0;
  let batchNum = 0;
  let nonce = await signer.getNonce();
  
  while (true) {
    batchNum++;
    const remaining = TOTAL_TXS === 0 ? BATCH_SIZE : Math.min(BATCH_SIZE, TOTAL_TXS - totalCompleted);
    
    if (TOTAL_TXS > 0 && totalCompleted >= TOTAL_TXS) {
      console.log(`\n🎯 Target of ${TOTAL_TXS} transactions reached!`);
      break;
    }
    
    const currentBalance = await hre.ethers.provider.getBalance(signer.address);
    if (currentBalance < MIN_BALANCE) {
      console.log(`\n⚠️  Balance too low (${hre.ethers.formatEther(currentBalance)} CELO). Stopping.`);
      break;
    }
    
    console.log(`\n--- Batch ${batchNum} (${remaining} txs) ---`);
    
    let batchGas = 0n;
    let batchCost = 0n;
    let batchCompleted = 0;
    
    for (let i = 1; i <= remaining; i++) {
      const txNum = totalCompleted + i;
      try {
        const tx = await contract.recordYield(txNum, { gasLimit: 50000, nonce: nonce });
        nonce++;
        const receipt = await tx.wait();
        const gasCost = receipt.gasUsed * receipt.gasPrice;
        batchGas += receipt.gasUsed;
        batchCost += gasCost;
        batchCompleted++;
        console.log(`[${txNum}] ✅ tx: ${tx.hash.slice(0, 18)}... | gas: ${receipt.gasUsed} | cost: ${hre.ethers.formatEther(gasCost)} CELO`);
        if (i < remaining) await new Promise(r => setTimeout(r, INTERVAL_MS));
      } catch (error) {
        console.log(`[${txNum}] ❌ Failed: ${error.message}`);
        nonce = await signer.getNonce();
      }
    }
    
    totalGasUsed += batchGas;
    totalCost += batchCost;
    totalCompleted += batchCompleted;
    
    const batchBalance = await hre.ethers.provider.getBalance(signer.address);
    console.log(`\n📊 Batch ${batchNum} Summary:`);
    console.log(`   Completed: ${batchCompleted}/${remaining}`);
    console.log(`   Batch cost: ${hre.ethers.formatEther(batchCost)} CELO`);
    console.log(`   Total completed: ${totalCompleted}`);
    console.log(`   Balance: ${hre.ethers.formatEther(batchBalance)} CELO`);
  }
 
  const endBalance = await hre.ethers.provider.getBalance(signer.address);
  console.log("\n========== FINAL SUMMARY ==========");
  console.log(`Total transactions: ${totalCompleted}`);
  console.log(`Total batches: ${batchNum}`);
  console.log(`Total gas used: ${totalGasUsed}`);
  console.log(`Total cost: ${hre.ethers.formatEther(totalCost)} CELO`);
  if (totalCompleted > 0) console.log(`Avg cost per tx: ${hre.ethers.formatEther(totalCost / BigInt(totalCompleted))} CELO`);
  console.log(`Remaining balance: ${hre.ethers.formatEther(endBalance)} CELO`);
}
 
main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
