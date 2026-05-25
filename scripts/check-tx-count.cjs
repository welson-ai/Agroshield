const { createPublicClient, http } = require("viem");
const { celo } = require("viem/chains");

const client = createPublicClient({
  chain: celo,
  transport: http("https://1rpc.io/celo"),
});

const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "totalYieldEarned",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = "0xa321f7217190C33262Acd6464981D3C44b8C5980";

async function main() {
  const totalYield = await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "totalYieldEarned",
  });

  // Since each tx N passes amount N, total = 1+2+...+n = n(n+1)/2
  // So n = (-1 + sqrt(1 + 8*total)) / 2
  const total = Number(totalYield);
  const n = Math.floor((Math.sqrt(1 + 8 * total) - 1) / 2);

  console.log("📊 Transaction Count Report");
  console.log("============================");
  console.log(`Total yield recorded: ${total}`);
  console.log(`Estimated transactions: ${n}`);
}

main().catch(console.error);
