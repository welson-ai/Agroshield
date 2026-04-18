import { useEffect } from 'react'
import { useWatchContractEvent } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'

export function useEventListeners() {
  // Pool Events
  const { data: liquidityProvided } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.POOL,
    abi: AGROSHIELD_ABIS.POOL,
    eventName: 'LiquidityProvided',
  })

  const { data: liquidityWithdrawn } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.POOL,
    abi: AGROSHIELD_ABIS.POOL,
    eventName: 'LiquidityWithdrawn',
  })

  const { data: reserveRatioUpdated } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.POOL,
    abi: AGROSHIELD_ABIS.POOL,
    eventName: 'ReserveRatioUpdated',
  })

  // Policy Events
  const { data: policyCreated } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.POLICY,
    abi: AGROSHIELD_ABIS.POLICY,
    eventName: 'PolicyCreated',
  })

  const { data: premiumPaid } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.POLICY,
    abi: AGROSHIELD_ABIS.POLICY,
    eventName: 'PremiumPaid',
  })

  const { data: policyTransferred } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.POLICY,
    abi: AGROSHIELD_ABIS.POLICY,
    eventName: 'PolicyTransferred',
  })

  // Oracle Events
  const { data: weatherDataSubmitted } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.ORACLE,
    abi: AGROSHIELD_ABIS.ORACLE,
    eventName: 'WeatherDataSubmitted',
  })

  const { data: payoutTriggered } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.ORACLE,
    abi: AGROSHIELD_ABIS.ORACLE,
    eventName: 'PayoutTriggered',
  })

  // Marketplace Events
  const { data: policyListed } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.MARKETPLACE,
    abi: AGROSHIELD_ABIS.MARKETPLACE,
    eventName: 'PolicyListed',
  })

  const { data: offerMade } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.MARKETPLACE,
    abi: AGROSHIELD_ABIS.MARKETPLACE,
    eventName: 'OfferMade',
  })

  const { data: marketplacePolicyTransferred } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.MARKETPLACE,
    abi: AGROSHIELD_ABIS.MARKETPLACE,
    eventName: 'PolicyTransferred',
  })

  // Dynamic Premiums Events
  const { data: locationRiskFactorUpdated } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.DYNAMIC_PREMIUMS,
    abi: AGROSHIELD_ABIS.DYNAMIC_PREMIUMS,
    eventName: 'LocationRiskFactorUpdated',
  })

  const { data: cropRiskProfileUpdated } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.DYNAMIC_PREMIUMS,
    abi: AGROSHIELD_ABIS.DYNAMIC_PREMIUMS,
    eventName: 'CropRiskProfileUpdated',
  })

  // Multi-Crop Policy Events
  const { data: multiCropPolicyCreated } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.MULTI_CROP_POLICY,
    abi: AGROSHIELD_ABIS.MULTI_CROP_POLICY,
    eventName: 'MultiCropPolicyCreated',
  })

  const { data: cropPayoutProcessed } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.MULTI_CROP_POLICY,
    abi: AGROSHIELD_ABIS.MULTI_CROP_POLICY,
    eventName: 'CropPayoutProcessed',
  })

  // Weather Prediction Events
  const { data: weatherPredicted } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.WEATHER_PREDICTION,
    abi: AGROSHIELD_ABIS.WEATHER_PREDICTION,
    eventName: 'WeatherPredicted',
  })

  const { data: predictionValidated } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.WEATHER_PREDICTION,
    abi: AGROSHIELD_ABIS.WEATHER_PREDICTION,
    eventName: 'PredictionValidated',
  })

  // Staking Events
  const { data: stakePositionCreated } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.INSURANCE_POOL_STAKING,
    abi: AGROSHIELD_ABIS.INSURANCE_POOL_STAKING,
    eventName: 'StakePositionCreated',
  })

  const { data: rewardsClaimed } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.INSURANCE_POOL_STAKING,
    abi: AGROSHIELD_ABIS.INSURANCE_POOL_STAKING,
    eventName: 'RewardsClaimed',
  })

  const { data: stakePositionWithdrawn } = useWatchContractEvent({
    address: AGROSHIELD_CONTRACTS.CELO.INSURANCE_POOL_STAKING,
    abi: AGROSHIELD_ABIS.INSURANCE_POOL_STAKING,
    eventName: 'StakePositionWithdrawn',
  })

  useEffect(() => {
    // Handle pool events
    if (liquidityProvided) {
      console.log('Liquidity provided:', liquidityProvided)
      // Could trigger toast notification, update UI state, etc.
    }

    if (liquidityWithdrawn) {
      console.log('Liquidity withdrawn:', liquidityWithdrawn)
    }

    if (reserveRatioUpdated) {
      console.log('Reserve ratio updated:', reserveRatioUpdated)
    }

    // Handle policy events
    if (policyCreated) {
      console.log('Policy created:', policyCreated)
    }

    if (premiumPaid) {
      console.log('Premium paid:', premiumPaid)
    }

    if (policyTransferred) {
      console.log('Policy transferred:', policyTransferred)
    }

    // Handle oracle events
    if (weatherDataSubmitted) {
      console.log('Weather data submitted:', weatherDataSubmitted)
    }

    if (payoutTriggered) {
      console.log('Payout triggered:', payoutTriggered)
    }

    // Handle marketplace events
    if (policyListed) {
      console.log('Policy listed:', policyListed)
    }

    if (offerMade) {
      console.log('Offer made:', offerMade)
    }

    if (marketplacePolicyTransferred) {
      console.log('Marketplace policy transferred:', marketplacePolicyTransferred)
    }

    // Handle dynamic premiums events
    if (locationRiskFactorUpdated) {
      console.log('Location risk factor updated:', locationRiskFactorUpdated)
    }

    if (cropRiskProfileUpdated) {
      console.log('Crop risk profile updated:', cropRiskProfileUpdated)
    }

    // Handle multi-crop policy events
    if (multiCropPolicyCreated) {
      console.log('Multi-crop policy created:', multiCropPolicyCreated)
    }

    if (cropPayoutProcessed) {
      console.log('Crop payout processed:', cropPayoutProcessed)
    }

    // Handle weather prediction events
    if (weatherPredicted) {
      console.log('Weather predicted:', weatherPredicted)
    }

    if (predictionValidated) {
      console.log('Prediction validated:', predictionValidated)
    }

    // Handle staking events
    if (stakePositionCreated) {
      console.log('Stake position created:', stakePositionCreated)
    }

    if (rewardsClaimed) {
      console.log('Rewards claimed:', rewardsClaimed)
    }

    if (stakePositionWithdrawn) {
      console.log('Stake position withdrawn:', stakePositionWithdrawn)
    }
  }, [
    liquidityProvided,
    liquidityWithdrawn,
    reserveRatioUpdated,
    policyCreated,
    premiumPaid,
    policyTransferred,
    weatherDataSubmitted,
    payoutTriggered,
    policyListed,
    offerMade,
    marketplacePolicyTransferred,
    locationRiskFactorUpdated,
    cropRiskProfileUpdated,
    multiCropPolicyCreated,
    cropPayoutProcessed,
    weatherPredicted,
    predictionValidated,
    stakePositionCreated,
    rewardsClaimed,
    stakePositionWithdrawn,
  ])

  return {
    // Pool events
    liquidityProvided,
    liquidityWithdrawn,
    reserveRatioUpdated,
    
    // Policy events
    policyCreated,
    premiumPaid,
    policyTransferred,
    
    // Oracle events
    weatherDataSubmitted,
    payoutTriggered,
    
    // Marketplace events
    policyListed,
    offerMade,
    marketplacePolicyTransferred,
    
    // Dynamic premiums events
    locationRiskFactorUpdated,
    cropRiskProfileUpdated,
    
    // Multi-crop policy events
    multiCropPolicyCreated,
    cropPayoutProcessed,
    
    // Weather prediction events
    weatherPredicted,
    predictionValidated,
    
    // Staking events
    stakePositionCreated,
    rewardsClaimed,
    stakePositionWithdrawn,
  }
}
