# 🌾 AgroShield - Advanced Parametric Crop Insurance Protocol

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescript.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 🌱 About AgroShield

AgroShield is a revolutionary decentralized parametric crop insurance platform built on the CELO blockchain. We provide farmers with affordable, transparent, and instant insurance coverage powered by smart contracts and real-time weather data.

### 🎯 Mission

Empower farmers worldwide with accessible crop insurance through blockchain technology, eliminating traditional insurance barriers and providing financial protection against climate-related agricultural losses.

### ✨ Key Features

- 🌾 **Parametric Insurance** - Automatic payouts based on weather parameters
- ⚡ **Instant Claims** - No paperwork, instant settlement
- 💰 **Affordable Premiums** - Lower costs through decentralization
- 🌍 **Global Access** - Available to farmers worldwide
- 🔒 **Transparent** - All transactions on blockchain
- 📱 **Mobile-First** - Optimized for mobile devices
- 🎨 **Beautiful UI** - Modern, responsive design with animations
- ♿ **Accessible** - WCAG 2.1 AA compliant interface
- 🚀 **Performant** - Optimized for speed and efficiency

## 🏗️ Architecture

### Smart Contracts

Our smart contract ecosystem includes:

1. **AgroShieldPool** - Liquidity management and fund allocation
2. **AgroShieldPolicy** - Policy creation and management
3. **AgroShieldOracle** - Weather data integration
4. **PolicyMarketplace** - Secondary market for policies
5. **InsurancePoolStaking** - Reward mechanisms for liquidity providers

### Frontend Architecture

Built with modern web technologies and comprehensive component system:

```
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   ├── components/             # Reusable UI components
│   │   │   ├── ui/               # Base UI components
│   │   │   ├── animations/        # Animation system
│   │   │   ├── responsive/        # Mobile-first components
│   │   │   ├── forms/           # Form components
│   │   │   └── error-boundaries/ # Error handling
│   │   ├── lib/                  # Utilities and helpers
│   │   ├── hooks/                 # Custom React hooks
│   │   └── types/                # TypeScript definitions
```

## 🎨 Component System

### UI Components

Our comprehensive component library includes:

#### Base Components
- **Button** - Multiple variants with hover effects and ARIA support
- **Card** - Responsive cards with animations and accessibility
- **Input** - Form inputs with validation and error handling
- **Modal** - Responsive modals and drawers with mobile support
- **Table** - Mobile-optimized data tables with search and pagination

#### Responsive Components
- **ResponsiveContainer** - Adaptive layouts with breakpoints
- **MobileNavigation** - Mobile-optimized navigation with hamburger menu
- **ResponsiveForm** - Mobile-friendly forms with validation
- **ResponsiveTable** - Adaptive table views for all screen sizes

#### Animation System
- **HoverEffects** - Scale, glow, float, rotate, shake animations
- **TransitionAnimations** - Fade, slide, scale, bounce effects
- **PageTransitions** - Smooth page and modal transitions
- **LoadingAnimations** - Advanced loading states and spinners

#### Error Handling
- **ErrorBoundary** - Comprehensive error catching and recovery
- **NetworkErrorBoundary** - Network-specific error handling
- **AsyncErrorBoundary** - Async operation error management
- **TransactionErrorBoundary** - Blockchain transaction error handling

### Accessibility Features

All components include:
- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Focus management
- ✅ WCAG 2.1 AA compliance
- ✅ Mobile touch optimization

## 📱 Mobile Optimization

AgroShield is built mobile-first with:

- **Responsive Design** - Optimized for all screen sizes (sm, md, lg, xl)
- **Touch Interactions** - Swipe gestures and mobile-friendly controls
- **Performance** - Optimized for mobile networks and devices
- **PWA Ready** - Progressive Web App capabilities
- **Mobile Navigation** - Hamburger menus and bottom tab bars

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
