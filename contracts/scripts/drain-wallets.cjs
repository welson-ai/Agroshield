const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config();

const WALLETS_FILE = path.join(__dirname, '..', 'generated-wallets.json');
const MAIN_WALLET = '0xEA65d20f0D3B6b77e467CF1FeCE21F7bc3166470';

async function main() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo.org');
  const wallets = JSON.parse(fs.readFileSync(WALLETS_FILE, 'utf8'));
  
  console.log('💸 Draining wallets back to main...');
  console.log('📍 Main wallet:', MAIN_WALLET);
  console.log('📂 Checking', wallets.length, 'wallets\n');

  let drained = 0;
  let totalDrained = 0n;

  for (let i = 0; i < wallets.length; i++) {
    const w = wallets[i];
    const signer = new ethers.Wallet(w.privateKey, provider);
    
    const bal = await provider.getBalance(w.address);
    if (bal === 0n) continue;

    const feeData = await provider.getFeeData();
    const gasCost = 21000n * feeData.gasPrice;
    
    if (bal <= gasCost) {
      console.log(`[${i+1}] ⏭️ Balance too low to drain (${ethers.formatEther(bal)} CELO)`);
      continue;
    }

    const sendAmount = bal - gasCost;
    
    try {
      const tx = await signer.sendTransaction({
        to: MAIN_WALLET,
        value: sendAmount,
        gasLimit: 21000,
        type: 0,
        gasPrice: feeData.gasPrice
      });
      await tx.wait();
      drained++;
      totalDrained += sendAmount;
      console.log(`[${i+1}] ✅ Drained ${ethers.formatEther(sendAmount)} CELO`);
    } catch (e) {
      console.log(`[${i+1}] ❌ ${e.message.slice(0, 50)}`);
    }
  }

  console.log('\n========== DRAIN SUMMARY ==========');
  console.log('Wallets drained:', drained);
  console.log('Total recovered:', ethers.formatEther(totalDrained), 'CELO');
}

main().catch(console.error);
