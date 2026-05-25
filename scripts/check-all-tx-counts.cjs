const { createPublicClient, http } = require("viem");
const { celo } = require("viem/chains");

const client = createPublicClient({
  chain: celo,
  transport: http("https://1rpc.io/celo"),
});

const ABI = [{
  "inputs": [],
  "name": "totalYieldEarned",
  "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "stateMutability": "view",
  "type": "function"
}];

const CONTRACTS = [
  { name: "Original", address: "0x74bFd5b1392a5588E7d9d2e6d741838F529070C2" },
  { name: "Solmate",  address: "0xa321f7217190C33262Acd6464981D3C44b8C5980" },
];

async function main() {
  let grandTotal = 0;
  console.log("📊 Transaction Count Report (All Contracts)");
  console.log("==========================================\n");

  for (const c of CONTRACTS) {
    try {
      const totalYield = await client.readContract({
        address: c.address,
        abi: ABI,
        functionName: "totalYieldEarned",
      });
      const total = Number(totalYield);
      const n = total > 0 ? Math.floor((Math.sqrt(1 + 8 * total) - 1) / 2) : 0;
      grandTotal += n;
      console.log(`${c.name}: ${c.address}`);
      console.log(`  Total yield: ${total.toLocaleString()}`);
      console.log(`  Transactions: ${n.toLocaleString()}\n`);
    } catch (e) {
      console.log(`${c.name}: ${c.address}`);
      console.log(`  Error: ${e.message}\n`);
    }
  }

  console.log("==========================================");
  console.log(`GRAND TOTAL: ${grandTotal.toLocaleString()} transactions`);
}

main().catch(console.error);
