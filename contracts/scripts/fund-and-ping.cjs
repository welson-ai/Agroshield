const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config();

const WALLETS_FILE = path.join(__dirname, '..', 'generated-wallets.json');
const CONTRACT = process.env.AGROINVEST_ADDRESS;
const ABI = ['function ping() external'];

async function main() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo.org');
  const mainSigner = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const wallets = JSON.parse(fs.readFileSync(WALLETS_FILE, 'utf8'));
  
  const START_INDEX = 500; // Continue from wallet 501 (need to generate more)
  const BATCH_SIZE = 200;  // Next batch
  const MIN_MAIN_BALANCE = ethers.parseEther('0.1');
  const FUND_AMOUNT = ethers.parseEther('0.006'); // Enough for 1 ping
  
  console.log('🚀 FUND & PING');
  console.log('==============');
  console.log('👤 Main wallet:', mainSigner.address);
  
  const mainBal = await provider.getBalance(mainSigner.address);
  console.log('💰 Main balance:', ethers.formatEther(mainBal), 'CELO');
  console.log('📍 Contract:', CONTRACT);
  console.log(`📂 Processing wallets ${START_INDEX + 1} to ${START_INDEX + BATCH_SIZE}\n`);

  if (mainBal < MIN_MAIN_BALANCE) {
    console.log('❌ Main balance too low!');
    return;
  }

  let funded = 0;
  let pinged = 0;
  let failed = 0;

  for (let i = START_INDEX; i < Math.min(START_INDEX + BATCH_SIZE, wallets.length); i++) {
    const w = wallets[i];
    const walletSigner = new ethers.Wallet(w.privateKey, provider);
    const contract = new ethers.Contract(CONTRACT, ABI, walletSigner);

    // Check main balance
    const currentMainBal = await provider.getBalance(mainSigner.address);
    if (currentMainBal < MIN_MAIN_BALANCE) {
      console.log(`\n⚠️ Main wallet low. Stopping.`);
      break;
    }

    // Fund wallet
    console.log(`[${i + 1}] Funding...`);
    try {
      const feeData = await provider.getFeeData();
      const fundTx = await mainSigner.sendTransaction({
        to: w.address,
        value: FUND_AMOUNT,
        type: 0,
        gasPrice: feeData.gasPrice
      });
      await fundTx.wait();
      funded++;
    } catch (e) {
      console.log(`[${i + 1}] ❌ Fund failed: ${e.message.slice(0, 40)}`);
      failed++;
      continue;
    }

    // Ping
    try {
      const feeData = await provider.getFeeData();
      const tx = await contract.ping({
        gasLimit: 25000,
        type: 0,
        gasPrice: feeData.gasPrice
      });
      await tx.wait();
      pinged++;
      console.log(`[${i + 1}] ✅ Funded & Pinged!`);
    } catch (e) {
      console.log(`[${i + 1}] ❌ Ping failed: ${e.message.slice(0, 40)}`);
      failed++;
    }
  }

  const endBal = await provider.getBalance(mainSigner.address);
  const spent = mainBal - endBal;
  console.log('\n========== SUMMARY ==========');
  console.log('Funded:', funded);
  console.log('Pinged:', pinged);
  console.log('Failed:', failed);
  console.log('CELO spent:', ethers.formatEther(spent), 'CELO');
  console.log('Cost per ping:', pinged > 0 ? ethers.formatEther(spent / BigInt(pinged)) : '0', 'CELO');
  console.log('Main balance:', ethers.formatEther(endBal), 'CELO');
}

main().catch(console.error);
