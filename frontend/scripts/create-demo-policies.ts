#!/usr/bin/env npx tsx

// Script to create demo policies on Celo mainnet
import { createPublicClient, createWalletClient, http, parseUnits } from 'viem'
import { celo } from 'viem/chains'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '../src/constants/contracts'

// Demo policy data
const demoPolicies = [
  {
    cropType: 'Maize',
    location: { lat: 1.0152, lon: 35.0069, name: 'Kitale' },
    coverageAmount: '1000', // cUSD
    rainfallThreshold: '50', // mm
    measurementPeriod: '90', // days
    description: 'Maize insurance policy for Kitale farm'
  },
  {
    cropType: 'Coffee',
    location: { lat: -0.4239, lon: 36.9513, name: 'Nyeri' },
    coverageAmount: '2500', // cUSD
    rainfallThreshold: '80', // mm
    measurementPeriod: '120', // days
    description: 'Coffee insurance policy for Nyeri farm'
  },
  {
    cropType: 'Tea',
    location: { lat: -0.3677, lon: 35.2850, name: 'Kericho' },
    coverageAmount: '3000', // cUSD
    rainfallThreshold: '100', // mm
    measurementPeriod: '150', // days
    description: 'Tea insurance policy for Kericho farm'
  },
  {
    cropType: 'Rice',
    location: { lat: -0.7833, lon: 37.3833, name: 'Mwea' },
    coverageAmount: '1500', // cUSD
    rainfallThreshold: '120', // mm
    measurementPeriod: '100', // days
    description: 'Rice insurance policy for Mwea farm'
  },
  {
    cropType: 'Wheat',
    location: { lat: -1.0789, lon: 35.8617, name: 'Narok' },
    coverageAmount: '2000', // cUSD
    rainfallThreshold: '60', // mm
    measurementPeriod: '110', // days
    description: 'Wheat insurance policy for Narok farm'
  }
]

async function createDemoPolicies() {
  console.log('Creating demo policies on Celo mainnet...')

  // Create clients
  const publicClient = createPublicClient({
    chain: celo,
    transport: http('https://celo-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161')
  })

  // Note: You'll need to set up a wallet client with your private key
  // For demo purposes, we'll just show the transaction data
  
  console.log('Demo policies to create:')
  demoPolicies.forEach((policy, index) => {
    console.log(`\n${index + 1}. ${policy.cropType} Policy`)
    console.log(`   Location: ${policy.location.name} (${policy.location.lat}, ${policy.location.lon})`)
    console.log(`   Coverage: ${policy.coverageAmount} cUSD`)
    console.log(`   Threshold: ${policy.rainfallThreshold}mm`)
    console.log(`   Period: ${policy.measurementPeriod} days`)
    console.log(`   Description: ${policy.description}`)
  })

  console.log('\nTo create these policies on Celo mainnet:')
  console.log('1. Set up your wallet client with private key')
  console.log('2. Ensure you have sufficient CELO for gas fees')
  console.log('3. Ensure you have cUSD for premium payments')
  console.log('4. Run the actual transaction calls')

  // Example transaction structure (commented out for safety)
  /*
  const walletClient = createWalletClient({
    chain: celo,
    transport: http('https://celo-mainnet.infura.io/v3/YOUR_INFURA_KEY'),
    account: privateKeyToAccount('YOUR_PRIVATE_KEY')
  })

  for (const policy of demoPolicies) {
    try {
      const txHash = await walletClient.writeContract({
        address: AGROSHIELD_CONTRACTS.CELO.POLICY as `0x${string}`,
        abi: AGROSHIELD_ABIS.POLICY,
        functionName: 'createPolicy',
        args: [
          parseUnits(policy.coverageAmount, 18), // coverageAmount
          parseUnits(policy.rainfallThreshold, 18), // rainfallThreshold
          policy.measurementPeriod, // measurementPeriod
          `${policy.location.lat},${policy.location.lon}`, // location
          policy.description // description
        ]
      })

      console.log(`Created ${policy.cropType} policy: ${txHash}`)
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`)
      
    } catch (error) {
      console.error(`Failed to create ${policy.cropType} policy:`, error)
    }
  }
  */
}

// Run the script
createDemoPolicies().catch(console.error)
