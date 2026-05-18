const solc = require('solc');
const fs = require('fs');
const path = require('path');
const { createPublicClient, createWalletClient, http, parseEther, formatEther } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
require('dotenv').config();

const CONTRACT_SOURCE = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IPool {
    function provideLiquidity(uint256 amount) external;
    function withdrawLiquidity(uint256 shares) external;
    function userShares(address user) external view returns (uint256);
}

contract AgroShieldBatchSpins {
    IERC20 public immutable cUSD;
    IPool public immutable pool;
    address public owner;
    
    event BatchCompleted(address indexed user, uint256 spins, uint256 totalAmount);
    
    constructor(address _cUSD, address _pool) {
        cUSD = IERC20(_cUSD);
        pool = IPool(_pool);
        owner = msg.sender;
    }
    
    function batchSpin(uint256 spinCount, uint256 amountPerSpin) external {
        require(spinCount > 0 && spinCount <= 100, "Invalid spin count");
        require(amountPerSpin > 0, "Amount must be > 0");
        
        uint256 totalAmount = spinCount * amountPerSpin;
        
        require(cUSD.transferFrom(msg.sender, address(this), totalAmount), "Transfer failed");
        require(cUSD.approve(address(pool), totalAmount), "Approve failed");
        
        for (uint256 i = 0; i < spinCount; i++) {
            pool.provideLiquidity(amountPerSpin);
            uint256 shares = pool.userShares(address(this));
            if (shares > 0) {
                pool.withdrawLiquidity(shares);
            }
        }
        
        uint256 remaining = cUSD.balanceOf(address(this));
        if (remaining > 0) {
            cUSD.transfer(msg.sender, remaining);
        }
        
        emit BatchCompleted(msg.sender, spinCount, totalAmount);
    }
    
    function emergencyWithdraw() external {
        require(msg.sender == owner, "Not owner");
        uint256 balance = cUSD.balanceOf(address(this));
        if (balance > 0) {
            cUSD.transfer(owner, balance);
        }
    }
}
`;

const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const POOL_ADDRESS = "0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6";
const RPC_URL = "https://forno.celo.org";
const CHAIN_ID = 42220;

async function main() {
  console.log("🚀 COMPILING AND DEPLOYING BATCH SPINS CONTRACT");
  console.log("================================================");

  // Compile contract
  console.log("\n📝 Compiling contract...");
  
  const input = {
    language: 'Solidity',
    sources: {
      'AgroShieldBatchSpins.sol': {
        content: CONTRACT_SOURCE
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error("❌ Compilation errors:");
      errors.forEach(e => console.error(e.formattedMessage));
      return;
    }
  }

  const contract = output.contracts['AgroShieldBatchSpins.sol']['AgroShieldBatchSpins'];
  const bytecode = '0x' + contract.evm.bytecode.object;
  const abi = contract.abi;
  
  console.log("✅ Contract compiled successfully!");
  console.log("📊 Bytecode size:", bytecode.length / 2, "bytes");

  // Deploy
  const privateKey = process.env.PRIVATE_KEY;
  const account = privateKeyToAccount(privateKey);
  console.log("\n👤 Deployer:", account.address);

  const publicClient = createPublicClient({
    chain: {
      id: CHAIN_ID,
      name: 'Celo',
      nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
      rpcUrls: { default: { http: [RPC_URL] } }
    },
    transport: http(RPC_URL)
  });

  const walletClient = createWalletClient({
    chain: {
      id: CHAIN_ID,
      name: 'Celo',
      nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
      rpcUrls: { default: { http: [RPC_URL] } }
    },
    transport: http(RPC_URL),
    account: account
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log("💰 CELO Balance:", formatEther(balance), "CELO");

  console.log("\n📋 Contract Parameters:");
  console.log("   💰 cUSD:", CUSD_ADDRESS);
  console.log("   🏊 Pool:", POOL_ADDRESS);

  try {
    const { encodeAbiParameters, parseAbiParameters } = require("viem");
    const constructorArgs = encodeAbiParameters(
      parseAbiParameters('address, address'),
      [CUSD_ADDRESS, POOL_ADDRESS]
    );
    
    const deployData = bytecode + constructorArgs.slice(2);

    console.log("\n🔨 Deploying contract...");
    
    const hash = await walletClient.sendTransaction({
      data: deployData,
    });

    console.log("📤 Deploy TX:", `https://celoscan.io/tx/${hash}`);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    console.log("\n✅ CONTRACT DEPLOYED!");
    console.log("📍 Contract Address:", receipt.contractAddress);
    console.log("⛽ Gas Used:", receipt.gasUsed.toString());

    // Save contract info
    fs.writeFileSync(
      '/Users/h/Documents/CascadeProjects/agroshield/scripts/batch-contract.json',
      JSON.stringify({
        address: receipt.contractAddress,
        abi: abi,
        deployTx: hash
      }, null, 2)
    );
    
    console.log("\n📝 Contract info saved to batch-contract.json");
    console.log("\n🎊 DEPLOYMENT COMPLETE!");
    console.log("🔗 Explorer:", `https://celoscan.io/address/${receipt.contractAddress}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
