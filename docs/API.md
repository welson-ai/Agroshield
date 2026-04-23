# AgroShield API Documentation

*Last updated: April 23, 2026*

## Overview

The AgroShield API provides access to insurance policies, claims, liquidity data, and weather information.

## Base URL

```
https://api.agroshield.io/v1
```

## Authentication

Include your API key in the Authorization header:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Policies

#### Get All Policies
```http
GET /policies
```

#### Get Policy by ID
```http
GET /policies/{policyId}
```

#### Create Policy
```http
POST /policies
Content-Type: application/json

{
  "cropType": "wheat",
  "coverageAmount": 1000,
  "rainfallThreshold": 50,
  "duration": 90
}
```

### Claims

#### Get All Claims
```http
GET /claims
```

#### Submit Claim
```http
POST /claims
Content-Type: application/json

{
  "policyId": "123",
  "claimType": "drought",
  "description": "Insufficient rainfall"
}
```

### Liquidity

#### Get Pool Stats
```http
GET /liquidity/pool
```

#### Get User Positions
```http
GET /liquidity/positions/{address}
```

### Weather

#### Get Weather Data
```http
GET /weather/{location}
```

#### Get Historical Data
```http
GET /weather/{location}/history
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limits

- 100 requests per minute
- 1000 requests per hour

## SDK

### JavaScript

```bash
npm install @agroshield/sdk
```

```javascript
import { AgroShieldSDK } from '@agroshield/sdk';

const sdk = new AgroShieldSDK('YOUR_API_KEY');

// Get policies
const policies = await sdk.policies.getAll();
```

### Python

```bash
pip install agroshield-sdk
```

```python
from agroshield import AgroShieldSDK

sdk = AgroShieldSDK('YOUR_API_KEY')

# Get policies
policies = sdk.policies.get_all()
```

## Support

For API support:
- Email: api@agroshield.io
- Documentation: https://docs.agroshield.io
