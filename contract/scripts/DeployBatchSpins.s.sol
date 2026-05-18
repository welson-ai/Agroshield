// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/AgroShieldBatchSpins.sol";

contract DeployBatchSpins is Script {
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address cUSDToken = 0x765DE816845861e75A25fCA122bb6898B8B1282a;
        address liquidityPool = 0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6;
        
        vm.startBroadcast(deployerPrivateKey);
        
        AgroShieldBatchSpins batchSpins = new AgroShieldBatchSpins(
            cUSDToken,
            liquidityPool
        );
        
        vm.stopBroadcast();
        
        console.log("🚀 AgroShield Batch Spins Contract Deployed!");
        console.log("📍 Contract Address:", address(batchSpins));
        console.log("💰 cUSD Token:", cUSDToken);
        console.log("🏊 Liquidity Pool:", liquidityPool);
        console.log("👤 Deployer:", vm.addr(deployerPrivateKey));
        
        // Verify deployment
        console.log("🔍 Verification:");
        console.log("   - cUSD Token:", address(batchSpins.cUSDToken()));
        console.log("   - Liquidity Pool:", address(batchSpins.liquidityPool()));
        console.log("   - Max Spins Per Batch:", batchSpins.MAX_SPINS_PER_BATCH());
        console.log("   - Min Spin Amount:", batchSpins.MIN_SPIN_AMOUNT());
    }
}
