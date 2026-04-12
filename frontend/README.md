# AgroShield Frontend

A Next.js 14 frontend for the AgroShield parametric crop insurance protocol on Celo blockchain.

## Features

- **Farmer Dashboard** - Purchase and manage insurance policies
- **Liquidity Pool** - Provide liquidity to earn yield
- **Admin Panel** - Protocol management and weather data submission
- **Wallet Integration** - Connect with MetaMask, WalletConnect, and more
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: Wagmi + Viem
- **Wallet**: RainbowKit
- **State**: React Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/welson-ai/Agroshield.git
cd Agroshield/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Add your WalletConnect Project ID
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

Get your WalletConnect Project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/).

### Contract Addresses

Contract addresses are configured in `src/lib/contracts.ts`:

```typescript
export const AGROSHIELD_CONTRACTS = {
  CELO: {
    CUSD_TOKEN: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
    POOL: "0xef65b6fe2e9de3fa865aa87107db4bcd458115d5",
    ORACLE: "0xaa4c5e3c0fe03da8d1a3145ccdf0ef5f8661442b",
    POLICY: "0xd857973f3f5313d0721d539fcbab1395bfc87d78",
  },
}
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Farmer dashboard
│   ├── pool/              # Liquidity pool page
│   ├── admin/             # Admin panel
│   ├── page.tsx           # Home page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navbar.tsx         # Navigation bar
│   └── providers.tsx      # App providers
├── lib/                  # Utility functions
│   ├── contracts.ts       # Contract addresses
│   ├── utils.ts          # Helper functions
│   └── wagmi.ts         # Wagmi configuration
└── styles/               # Global styles
```

## Pages

### Home (`/`)
- Landing page with protocol overview
- Feature highlights
- Protocol statistics

### Dashboard (`/dashboard`)
- Create new insurance policies
- View active policies
- Policy management interface

### Pool (`/pool`)
- Provide liquidity to insurance pool
- Withdraw liquidity
- View pool statistics and earnings

### Admin (`/admin`)
- Submit weather data
- Contract management
- Protocol statistics

## Smart Contracts

The frontend interacts with three main contracts:

1. **AgroShieldPool** - Manages liquidity and payouts
2. **AgroShieldPolicy** - Handles policy creation and management
3. **AgroShieldOracle** - Weather data oracle for automated payouts

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Components

Use shadcn/ui for consistent design:

```bash
npx shadcn@latest add [component-name]
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

### Manual Build

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
