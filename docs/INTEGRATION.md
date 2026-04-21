# Integration Guide

## Overview

This guide helps developers integrate AgroShield into their applications and services.

## API Integration

### Authentication

Get your API key from the [AgroShield Dashboard](https://agroshield.io/dashboard):

```javascript
const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://api.agroshield.io/v1';
```

### SDK Installation

#### JavaScript/TypeScript
```bash
npm install @agroshield/sdk
```

```javascript
import { AgroShieldSDK } from '@agroshield/sdk';

const sdk = new AgroShieldSDK({
  apiKey: 'your_api_key',
  network: 'celo-mainnet'
});
```

#### Python
```bash
pip install agroshield-sdk
```

```python
from agroshield import AgroShieldSDK

sdk = AgroShieldSDK(
    api_key='your_api_key',
    network='celo-mainnet'
)
```

### Core API Endpoints

#### Policies
```javascript
// Get all policies
const policies = await sdk.policies.getAll({
  limit: 50,
  offset: 0,
  status: 'active'
});

// Get specific policy
const policy = await sdk.policies.get('policy_id_here');

// Create policy
const newPolicy = await sdk.policies.create({
  cropType: 'wheat',
  coverageAmount: 1000,
  rainfallThreshold: 50,
  duration: 90
});
```

#### Claims
```javascript
// Get claims
const claims = await sdk.claims.getAll({
  policyId: 'policy_id_here'
});

// Submit claim
const claim = await sdk.claims.submit({
  policyId: 'policy_id_here',
  claimType: 'drought',
  description: 'Insufficient rainfall detected'
});
```

#### Liquidity
```javascript
// Get pool stats
const stats = await sdk.liquidity.getPoolStats();

// Get user positions
const positions = await sdk.liquidity.getUserPositions('user_address');

// Provide liquidity
const result = await sdk.liquidity.provide({
  amount: 1000,
  token: 'cUSD',
  duration: 90
});
```

## Smart Contract Integration

### Contract Addresses

```javascript
const CONTRACTS = {
  MAINNET: {
    AGROSHIELD_POOL: '0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6',
    AGROSHIELD_POLICY: '0x...', // Update after deployment
    AGROSHIELD_ORACLE: '0x...'  // Update after deployment
  },
  ALFAJORES: {
    AGROSHIELD_POOL: '0x...', // Testnet address
    AGROSHIELD_POLICY: '0x...',
    AGROSHIELD_ORACLE: '0x...'
  }
};
```

### Web3 Integration

#### Using ethers.js
```javascript
import { ethers } from 'ethers';
import AgroShieldPool from './abis/AgroShieldPool.json';

// Connect to Celo
const provider = new ethers.providers.JsonRpcProvider(
  'https://forno.celo.org'
);

const contract = new ethers.Contract(
  CONTRACTS.MAINNET.AGROSHIELD_POOL,
  AgroShieldPool.abi,
  provider
);

// Read contract data
const totalLiquidity = await contract.totalLiquidity();
const userBalance = await contract.balanceOf(userAddress);

// Write to contract (with signer)
const signer = provider.getSigner();
const contractWithSigner = contract.connect(signer);

await contractWithSigner.provideLiquidity(
  ethers.utils.parseUnits('1000', 18),
  { gasLimit: 200000 }
);
```

#### Using viem
```javascript
import { createPublicClient, createWalletClient, http } from 'viem';
import { celo } from 'viem/chains';
import { agroShieldPoolAbi } from './abis';

const publicClient = createPublicClient({
  chain: celo,
  transport: http('https://forno.celo.org')
});

const walletClient = createWalletClient({
  chain: celo,
  transport: http(),
  account: privateKey
});

// Read data
const totalLiquidity = await publicClient.readContract({
  address: CONTRACTS.MAINNET.AGROSHIELD_POOL,
  abi: agroShieldPoolAbi,
  functionName: 'totalLiquidity'
});

// Write data
const hash = await walletClient.writeContract({
  address: CONTRACTS.MAINNET.AGROSHIELD_POOL,
  abi: agroShieldPoolAbi,
  functionName: 'provideLiquidity',
  args: [parseUnits('1000', 18)]
});
```

## Webhook Integration

### Setting Up Webhooks

Configure webhooks to receive real-time updates:

```javascript
// Webhook endpoint example (Express.js)
app.post('/webhook/agroshield', (req, res) => {
  const event = req.body;
  
  switch(event.type) {
    case 'policy.created':
      handlePolicyCreated(event.data);
      break;
    case 'claim.approved':
      handleClaimApproved(event.data);
      break;
    case 'payout.processed':
      handlePayoutProcessed(event.data);
      break;
  }
  
  res.status(200).send('OK');
});
```

### Event Types

- `policy.created` - New policy created
- `policy.activated` - Policy activated after premium payment
- `policy.expired` - Policy reached expiration date
- `claim.submitted` - New claim submitted
- `claim.approved` - Claim approved for payout
- `claim.rejected` - Claim rejected
- `payout.processed` - Payout sent to user
- `liquidity.provided` - New liquidity added
- `liquidity.withdrawn` - Liquidity removed

## Frontend Integration

### React Components

#### Policy Widget
```jsx
import { AgroShieldPolicyWidget } from '@agroshield/react-widgets';

function MyApp() {
  return (
    <div>
      <AgroShieldPolicyWidget
        onPolicyCreated={(policy) => console.log(policy)}
        theme="dark"
        defaultCrop="wheat"
      />
    </div>
  );
}
```

#### Liquidity Provider Widget
```jsx
import { AgroShieldLiquidityWidget } from '@agroshield/react-widgets';

function LiquiditySection() {
  return (
    <AgroShieldLiquidityWidget
      onLiquidityProvided={(result) => console.log(result)}
      showRewards={true}
      defaultToken="cUSD"
    />
  );
}
```

### Wallet Integration

#### MetaMask Integration
```javascript
import { MetaMaskConnector } from '@agroshield/wallet-connectors';

const connector = new MetaMaskConnector();

// Connect wallet
await connector.connect();

// Get account
const account = await connector.getAccount();

// Sign transaction
const txHash = await connector.signTransaction({
  to: CONTRACTS.MAINNET.AGROSHIELD_POOL,
  data: encodedFunctionCall,
  value: '0x0'
});
```

#### MiniPay Integration
```javascript
import { MiniPayConnector } from '@agroshield/wallet-connectors';

// Auto-detect MiniPay
if (window.minipay) {
  const connector = new MiniPayConnector();
  await connector.connect();
  
  // MiniPay-specific features
  const balance = await connector.getBalance('cUSD');
  const network = await connector.getNetwork();
}
```

## Mobile Integration

### React Native

```javascript
import { AgroShieldSDK } from '@agroshield/react-native';

const sdk = new AgroShieldSDK({
  apiKey: 'your_api_key',
  platform: 'mobile'
});

// Use mobile-specific features
await sdk.policies.createPolicy({
  cropType: 'wheat',
  location: await sdk.geolocation.getCurrentPosition(),
  photos: await sdk.camera.takePhotos()
});
```

### Flutter

```dart
import 'package:agroshield/agroshield.dart';

void main() async {
  final sdk = AgroShieldSDK(apiKey: 'your_api_key');
  
  // Create policy
  final policy = await sdk.createPolicy(
    cropType: 'wheat',
    coverageAmount: 1000.0
  );
}
```

## Data Integration

### Weather Data Providers

```javascript
// Custom weather data provider
class CustomWeatherProvider {
  async submitWeatherData(data) {
    const response = await fetch('/api/weather', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        location: data.location,
        rainfall: data.rainfall,
        timestamp: data.timestamp,
        source: 'custom_provider'
      })
    });
    
    return response.json();
  }
}
```

### Database Integration

```sql
-- Store policy data
CREATE TABLE policies (
  id VARCHAR(255) PRIMARY KEY,
  user_address VARCHAR(255) NOT NULL,
  crop_type VARCHAR(100) NOT NULL,
  coverage_amount DECIMAL(20, 8) NOT NULL,
  rainfall_threshold DECIMAL(10, 2) NOT NULL,
  premium_amount DECIMAL(20, 8) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Store claim data
CREATE TABLE claims (
  id VARCHAR(255) PRIMARY KEY,
  policy_id VARCHAR(255) NOT NULL,
  claim_type VARCHAR(100) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  status VARCHAR(50) NOT NULL,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (policy_id) REFERENCES policies(id)
);
```

## Testing Integration

### Test Environment Setup

```javascript
// Test configuration
const TEST_CONFIG = {
  network: 'alfajores',
  rpcUrl: 'https://alfajores-forno.celo-testnet.org',
  testAccounts: [
    '0x...', // Test account 1
    '0x...'  // Test account 2
  ]
};

// Mock data for testing
const mockPolicy = {
  cropType: 'wheat',
  coverageAmount: 1000,
  rainfallThreshold: 50,
  duration: 90
};
```

### Integration Tests

```javascript
describe('AgroShield Integration', () => {
  test('should create policy', async () => {
    const policy = await sdk.policies.create(mockPolicy);
    expect(policy.id).toBeDefined();
    expect(policy.status).toBe('pending');
  });

  test('should provide liquidity', async () => {
    const result = await sdk.liquidity.provide({
      amount: 100,
      token: 'cUSD'
    });
    expect(result.transactionHash).toBeDefined();
  });
});
```

## Best Practices

### Security
- Never expose private keys in frontend code
- Use environment variables for sensitive data
- Implement proper input validation
- Use HTTPS for all API calls
- Validate all contract interactions

### Performance
- Implement caching for API responses
- Use pagination for large datasets
- Optimize smart contract calls
- Batch operations when possible
- Monitor gas costs

### Error Handling
```javascript
try {
  const policy = await sdk.policies.create(policyData);
  return policy;
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    // Handle insufficient funds
  } else if (error.code === 'NETWORK_ERROR') {
    // Handle network issues
  } else {
    // Handle other errors
    console.error('Policy creation failed:', error);
  }
}
```

### Rate Limiting
- Respect API rate limits (100 requests/minute)
- Implement exponential backoff for retries
- Cache responses to reduce API calls
- Use bulk endpoints when available

## Support

### Documentation
- [API Reference](./API.md)
- [SDK Documentation](https://docs.agroshield.io/sdk)
- [Smart Contract Docs](https://docs.agroshield.io/contracts)

### Community
- Discord: #integration channel
- GitHub: Issues and discussions
- Email: developers@agroshield.io

### Getting Help
- Check the FAQ first
- Search existing GitHub issues
- Provide detailed error reports
- Include code examples in issues

---

Ready to start building? Join our developer community and get access to our comprehensive SDK and documentation!
