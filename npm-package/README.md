# agroshield-utils

Utility functions for AgroShield - DeFi crop insurance on Celo blockchain.

## Installation

```bash
npm install agroshield-utils
```

## Usage

```javascript
const { formatCelo, calculatePremium, isValidAddress, getCeloConfig } = require('agroshield-utils');

// Format CELO amount
console.log(formatCelo('1000000000000000000')); // "1.0000 CELO"

// Calculate insurance premium
const premium = calculatePremium(1000, 0.05); // $50 for $1000 coverage

// Validate address
console.log(isValidAddress('0x1234...')); // true/false

// Get Celo config
const config = getCeloConfig();
```

## API

### `formatCelo(amount)`
Format wei amount to CELO string.

### `calculatePremium(coverage, riskFactor)`
Calculate insurance premium based on coverage and risk.

### `isValidAddress(address)`
Validate Celo/Ethereum address format.

### `getCeloConfig()`
Get Celo mainnet configuration.

## License

MIT
