const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config();

const WALLETS_FILE = path.join(__dirname, '..', 'generated-wallets.json');
const CONTRACT = process.env.AGROINVEST_ADDRESS;
const ABI = ['function ping() external'];

async function main() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo.org');
  const wallets = JSON.parse(fs.readFileSync(WALLETS_FILE, 'utf8'));
  
  console.log('📡 Pinging contract:', CONTRACT);
  console.log('📂 Loaded', wallets.length, 'wallets\n');

  let successful = 0;
  let failed = 0;

  for (let i = 0; i < 110; i++) {
    const w = wallets[i];
    const signer = new ethers.Wallet(w.privateKey, provider);
    const contract = new ethers.Contract(CONTRACT, ABI, signer);

    try {
      const bal = await provider.getBalance(w.address);
      if (bal === 0n) {
        console.log(`[${i+1}] ⏭️ Skipped (no balance)`);
        continue;
      }

      const feeData = await provider.getFeeData();
      const tx = await contract.ping({ 
        gasLimit: 25000,
        type: 0,  // Legacy tx for Celo
        gasPrice: feeData.gasPrice
      });
      await tx.wait();
      successful++;
      console.log(`[${i+1}/110] ✅ Pinged!`);
    } catch (e) {
      console.log(`[${i+1}/110] ❌ ${e.message.slice(0, 60)}`);
      failed++;
    }
  }

  console.log('\n========== SUMMARY ==========');
  console.log('Successful:', successful);
  console.log('Failed:', failed);
}

main().catch(console.error);
