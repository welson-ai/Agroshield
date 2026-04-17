// MiniPay Testing Script
// Copy and paste this into browser console on AgroShield app

console.log('🧪 MiniPay Testing Script Loaded');

// Test 1: Check current MiniPay detection
console.log('📱 Current MiniPay Detection:', {
    hasEthereum: typeof window.ethereum !== 'undefined',
    isMiniPay: window.ethereum?.isMiniPay,
    chainId: window.ethereum?.chainId,
    networkVersion: window.ethereum?.networkVersion
});

// Test 2: Simulate MiniPay
function simulateMiniPay() {
    console.log('🔄 Simulating MiniPay...');
    
    if (typeof window.ethereum === 'undefined') {
        window.ethereum = {};
    }
    
    window.ethereum.isMiniPay = true;
    window.ethereum.chainId = '0xa4ec'; // Celo mainnet
    window.ethereum.networkVersion = '42220';
    
    console.log('✅ MiniPay simulated:', window.ethereum);
    
    // Trigger re-render by reloading the component
    window.location.reload();
}

// Test 3: Check hook behavior
function checkMiniPayHook() {
    // Look for MiniPay indicators in the DOM
    const miniPayElements = document.querySelectorAll('[data-minipay]');
    const walletElements = document.querySelectorAll('[class*="wallet"]');
    
    console.log('🔍 MiniPay Elements Found:', miniPayElements.length);
    console.log('💳 Wallet Elements Found:', walletElements.length);
    
    // Check if MiniPay wallet component is rendered
    const miniPayWallet = document.querySelector('.text-green-600');
    const rainbowKit = document.querySelector('[class*="rainbow"]');
    
    console.log('🌈 RainbowKit Present:', !!rainbowKit);
    console.log('📱 MiniPay Wallet Present:', !!miniPayWallet);
}

// Test 4: Network detection
function testNetworkDetection() {
    console.log('🌐 Network Detection Test:');
    console.log('Chain ID (hex):', window.ethereum?.chainId);
    console.log('Chain ID (decimal):', window.ethereum?.networkVersion);
    console.log('Is Celo Mainnet:', 
        window.ethereum?.chainId === '0xa4ec' || 
        window.ethereum?.networkVersion === '42220'
    );
}

// Export functions for manual testing
window.testMiniPay = {
    simulate: simulateMiniPay,
    checkHook: checkMiniPayHook,
    testNetwork: testNetworkDetection
};

console.log('🎯 MiniPay Test Functions Available:');
console.log('- testMiniPay.simulate() - Simulate MiniPay browser');
console.log('- testMiniPay.checkHook() - Check hook behavior');
console.log('- testMiniPay.testNetwork() - Test network detection');
