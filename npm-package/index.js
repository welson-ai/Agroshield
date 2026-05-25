/**
 * AgroShield Utils
 * Utility functions for DeFi crop insurance on Celo
 */

const CELO_MAINNET_RPC = 'https://forno.celo.org';
const CELO_CHAIN_ID = 42220;

/**
 * Format CELO amount for display
 * @param {string|number} amount - Amount in wei
 * @returns {string} Formatted amount
 */
function formatCelo(amount) {
  return (Number(amount) / 1e18).toFixed(4) + ' CELO';
}

/**
 * Calculate insurance premium
 * @param {number} coverage - Coverage amount in USD
 * @param {number} riskFactor - Risk factor (0-1)
 * @returns {number} Premium amount
 */
function calculatePremium(coverage, riskFactor = 0.05) {
  return coverage * riskFactor;
}

/**
 * Validate Celo address
 * @param {string} address - Wallet address
 * @returns {boolean} Is valid
 */
function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Get Celo network config
 * @returns {object} Network configuration
 */
function getCeloConfig() {
  return {
    rpc: CELO_MAINNET_RPC,
    chainId: CELO_CHAIN_ID,
    name: 'Celo Mainnet'
  };
}

module.exports = {
  formatCelo,
  calculatePremium,
  isValidAddress,
  getCeloConfig,
  CELO_MAINNET_RPC,
  CELO_CHAIN_ID
};
