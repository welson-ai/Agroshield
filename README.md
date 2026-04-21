# AgroShield - Advanced Parametric Crop Insurance Protocol

AgroShield is a cutting-edge decentralized parametric crop insurance protocol built on Celo, providing farmers with automated insurance payouts based on weather conditions. The protocol uses smart contracts to manage liquidity, policies, and weather oracles.

## Architecture

The protocol consists of three main contracts:

1. **AgroShieldPool** - Manages liquidity from providers and handles payouts
2. **AgroShieldPolicy** - Allows farmers to create and manage insurance policies
3. **AgroShieldOracle** - Collects weather data and triggers automatic payouts

## Features

- **Parametric Insurance**: Automatic payouts based on rainfall thresholds
- **Decentralized Oracle**: Weather data from multiple providers with verification
- **Liquidity Pool**: cUSD-based liquidity provision with reserve management
- **Transparent Premiums**: Risk-based premium calculation
- **Celo Native**: Built for Celo with cUSD integration
- **MiniPay Compatibility**: Seamless mobile wallet integration for Celo users

## Contract Details

### AgroShieldPool
- Accepts cUSD deposits from liquidity providers
- Maintains 10% reserve ratio for stability
- Processes payouts for authorized policies
- Share-based liquidity tracking

### AgroShieldPolicy
- Farmers create policies with coverage amount and rainfall thresholds
- Premiums calculated based on coverage, risk factors, and duration
- Policies activated upon premium payment
- Automatic payout triggering via oracle

### AgroShieldOracle
- Multi-provider weather data submission
- Consensus-based data verification
- Historical weather data storage
- Payout triggering when thresholds are breached

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Celo wallet with test CELO and cUSD

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd agroshield

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Configuration

Update `.env` with your private key:

```bash
PRIVATE_KEY=your_private_key_here
```

## Usage

### Testing

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/agroshield.test.js
```

### Deployment

#### Local Testing
```bash
# Deploy to local Hardhat network
npx hardhat run scripts/deploy.js --network hardhat
```

#### Celo Alfajores Testnet
```bash
# Deploy to Celo Alfajores testnet
npx hardhat run scripts/deploy.js --network alfajores
```

#### Celo Mainnet
```bash
# Deploy to Celo mainnet
npx hardhat run scripts/deploy.js --network celo
```

## MiniPay Integration

AgroShield frontend provides seamless integration with MiniPay, the mobile wallet for Celo ecosystem.

### MiniPay Features

- **Auto-Connection**: MiniPay users connect automatically without wallet selection modal
- **cUSD Native**: Uses cUSD as default currency for MiniPay users  
- **Mobile Optimized**: MiniPay-branded wallet UI designed for mobile experience
- **Network Detection**: Automatically detects Celo mainnet (chainId 42220)
- **Streamlined UX**: Hides wallet selection UI for MiniPay users

### Testing MiniPay

#### Browser Testing (Simulation)

1. Navigate to frontend directory: `cd frontend`
2. Start dev server: `npm run dev`
3. Open simulator: `http://localhost:3000/test-minipay.html`
4. Click "Simulate MiniPay Browser"
5. Click "Open AgroShield" 
6. Verify MiniPay behavior

#### Phone Testing (Real MiniPay)

1. Start dev server for phone access: `npm run dev --hostname 0.0.0.0`
2. Find your IP address (e.g., `192.168.1.44`)
3. Open MiniPay app on your phone
4. Navigate to: `http://YOUR_IP:3000`
5. Verify auto-connection and MiniPay UI

**Detailed testing guide**: See `frontend/PHONE_TESTING_GUIDE.md`

### Expected MiniPay Behavior

When using MiniPay, users should see:

- **Auto-connection** without wallet selection modal
- **Green "MP" badge** in navbar
- **cUSD balance display**
- **"Celo Mainnet"** status indicator
- **Disconnect button** for manual disconnection
- **No RainbowKit wallet button**

### Frontend Setup for MiniPay

The MiniPay integration is implemented in the frontend:

```bash
cd frontend
npm install
npm run dev
```

**Frontend documentation**: See `frontend/README.md` for complete MiniPay implementation details.

## Contract Addresses

### Celo Alfajores Testnet
- cUSD Token: `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`
- AgroShieldPool: (deployed after running script)
- AgroShieldPolicy: (deployed after running script)
- AgroShieldOracle: (deployed after running script)

## How It Works

1. **Liquidity Provision**: Users provide cUSD liquidity to the pool and receive shares
2. **Policy Creation**: Farmers create policies specifying coverage amount and rainfall thresholds
3. **Premium Payment**: Farmers pay premiums in cUSD to activate their policies
4. **Weather Data**: Authorized weather providers submit rainfall data
5. **Automatic Payout**: When rainfall falls below threshold, oracle triggers automatic payout
6. **Claims Processing**: Payouts are processed from the pool to the farmer's wallet

## Risk Management

- **Reserve Ratio**: 10% reserve maintained for stability
- **Multi-Provider Oracle**: Weather data requires multiple confirmations
- **Premium Calculation**: Risk-based pricing ensures pool sustainability
- **Coverage Limits**: Maximum coverage amounts to prevent excessive risk

## Security Features

- **Reentrancy Protection**: All external calls protected
- **Access Control**: Owner-only functions for critical operations
- **Input Validation**: All parameters validated before processing
- **Emergency Functions**: Owner-only recovery mechanisms

## Development

### Contract Structure
```
contracts/
  AgroShieldPool.sol      # Liquidity management
  AgroShieldPolicy.sol    # Policy creation and management
  AgroShieldOracle.sol    # Weather data and payouts
```

### Scripts
```
scripts/
  deploy.js               # Deployment script for all contracts
```

### Tests
```
test/
  agroshield.test.js      # Comprehensive test suite
  MockERC20.sol          # Mock cUSD token for testing
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

This software is provided as-is for educational and testing purposes. Use at your own risk. Always audit smart contracts before using with real funds.
