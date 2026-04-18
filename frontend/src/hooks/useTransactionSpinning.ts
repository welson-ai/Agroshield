import { useState, useEffect, useRef } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts'
import { parseEther, formatEther } from 'viem'
import { useTransactionToast } from './useTransactionToast'

interface TransactionConfig {
  id: string
  contract: 'POOL' | 'POLICY' | 'MARKETPLACE' | 'STAKING'
  functionName: string
  args: any[]
  value?: string
  interval?: number // milliseconds between transactions
  count?: number // number of transactions to spin
  autoWithdraw?: boolean // auto-withdraw after certain conditions
}

interface TransactionResult {
  hash: string
  status: 'pending' | 'success' | 'failed'
  timestamp: Date
  gasUsed?: string
  error?: string
}

export function useTransactionSpinning() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [activeTransactions, setActiveTransactions] = useState<Map<string, TransactionResult[]>>(new Map())
  const [spinningStats, setSpinningStats] = useState({
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    totalGasUsed: '0',
    totalValueTransacted: '0'
  })
  
  const { writeContract, data: writeData, isPending: isWriting } = useWriteContract()
  const { showSuccessToast, showErrorToast, showLoadingToast } = useTransactionToast()
  const intervalRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const getContractAddress = (contract: string) => {
    switch (contract) {
      case 'POOL': return AGROSHIELD_CONTRACTS.CELO.POOL
      case 'POLICY': return AGROSHIELD_CONTRACTS.CELO.POLICY
      case 'MARKETPLACE': return AGROSHIELD_CONTRACTS.CELO.MARKETPLACE
      case 'STAKING': return AGROSHIELD_CONTRACTS.CELO.INSURANCE_POOL_STAKING
      default: return AGROSHIELD_CONTRACTS.CELO.POOL
    }
  }

  const executeTransaction = async (config: TransactionConfig) => {
    try {
      const contractAddress = getContractAddress(config.contract)
      const contractAbi = AGROSHIELD_ABIS[config.contract]
      
      const txArgs = {
        address: contractAddress,
        abi: contractAbi,
        functionName: config.functionName,
        args: config.args,
        ...(config.value && { value: parseEther(config.value) })
      }

      const hash = await writeContract(txArgs)
      
      const result: TransactionResult = {
        hash,
        status: 'pending',
        timestamp: new Date()
      }

      setActiveTransactions(prev => {
        const newMap = new Map(prev)
        const existing = newMap.get(config.id) || []
        newMap.set(config.id, [...existing, result])
        return newMap
      })

      setSpinningStats(prev => ({
        ...prev,
        totalTransactions: prev.totalTransactions + 1,
        totalValueTransacted: (
          parseFloat(prev.totalValueTransacted) + 
          parseFloat(config.value || '0')
        ).toString()
      }))

      return hash
    } catch (error) {
      const result: TransactionResult = {
        hash: '',
        status: 'failed',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      setActiveTransactions(prev => {
        const newMap = new Map(prev)
        const existing = newMap.get(config.id) || []
        newMap.set(config.id, [...existing, result])
        return newMap
      })

      setSpinningStats(prev => ({
        ...prev,
        failedTransactions: prev.failedTransactions + 1
      }))

      throw error
    }
  }

  const startSpinning = async (configs: TransactionConfig[]) => {
    setIsSpinning(true)
    showLoadingToast(`Starting ${configs.length} transaction spinning sequences...`)

    for (const config of configs) {
      // Clear any existing interval for this config
      const existingInterval = intervalRefs.current.get(config.id)
      if (existingInterval) {
        clearInterval(existingInterval)
      }

      // Execute initial transaction
      try {
        await executeTransaction(config)
      } catch (error) {
        console.error(`Initial transaction failed for ${config.id}:`, error)
      }

      // Set up recurring transactions if interval is specified
      if (config.interval && config.count && config.count > 1) {
        let transactionCount = 1
        
        const interval = setInterval(async () => {
          if (transactionCount >= config.count!) {
            clearInterval(interval)
            intervalRefs.current.delete(config.id)
            
            // Auto-withdraw if enabled
            if (config.autoWithdraw) {
              await executeAutoWithdraw(config)
            }
            
            return
          }

          try {
            await executeTransaction(config)
            transactionCount++
          } catch (error) {
            console.error(`Recurring transaction failed for ${config.id}:`, error)
            transactionCount++
          }
        }, config.interval)

        intervalRefs.current.set(config.id, interval)
      }
    }
  }

  const executeAutoWithdraw = async (config: TransactionConfig) => {
    try {
      showLoadingToast('Executing auto-withdraw...')
      
      // Auto-withdraw logic based on contract type
      if (config.contract === 'POOL') {
        // Withdraw liquidity
        const transactions = activeTransactions.get(config.id) || []
        const successfulTxs = transactions.filter(tx => tx.status === 'success')
        
        if (successfulTxs.length > 0) {
          // Withdraw a portion of the accumulated value
          const withdrawAmount = (parseFloat(config.value || '0') * successfulTxs.length * 0.8).toString()
          
          await writeContract({
            address: getContractAddress('POOL'),
            abi: AGROSHIELD_ABIS.POOL,
            functionName: 'withdrawLiquidity',
            args: [parseEther(withdrawAmount)]
          })
          
          showSuccessToast(`Auto-withdrew ${withdrawAmount} cUSD from pool`)
        }
      }

      if (config.contract === 'STAKING') {
        // Claim rewards and withdraw stake
        await writeContract({
          address: getContractAddress('STAKING'),
          abi: AGROSHIELD_ABIS.INSURANCE_POOL_STAKING,
          functionName: 'claimRewards',
          args: [1] // Assuming position ID 1
        })
        
        showSuccessToast('Auto-claimed staking rewards')
      }
    } catch (error) {
      showErrorToast('Auto-withdraw failed')
      console.error('Auto-withdraw error:', error)
    }
  }

  const stopSpinning = (configId?: string) => {
    if (configId) {
      // Stop specific spinning sequence
      const interval = intervalRefs.current.get(configId)
      if (interval) {
        clearInterval(interval)
        intervalRefs.current.delete(configId)
      }
    } else {
      // Stop all spinning sequences
      intervalRefs.current.forEach(interval => clearInterval(interval))
      intervalRefs.current.clear()
      setIsSpinning(false)
      showSuccessToast('All transaction spinning stopped')
    }
  }

  const getTransactionStatus = (configId: string) => {
    const transactions = activeTransactions.get(configId) || []
    return {
      transactions,
      total: transactions.length,
      successful: transactions.filter(tx => tx.status === 'success').length,
      failed: transactions.filter(tx => tx.status === 'failed').length,
      pending: transactions.filter(tx => tx.status === 'pending').length
    }
  }

  // Preset spinning configurations
  const presetConfigs = {
    // Rapid liquidity provision and withdrawal
    liquiditySpinning: {
      id: 'liquidity-spin',
      contract: 'POOL' as const,
      functionName: 'provideLiquidity',
      args: [parseEther('100')],
      value: '100',
      interval: 2000, // 2 seconds
      count: 10,
      autoWithdraw: true
    },

    // Policy creation spinning
    policySpinning: {
      id: 'policy-spin',
      contract: 'POLICY' as const,
      functionName: 'createPolicy',
      args: [
        'Test Policy',
        parseEther('1000'),
        80,
        90,
        '1.0152,35.0069',
        1
      ],
      value: '100', // Premium
      interval: 3000, // 3 seconds
      count: 5
    },

    // Staking spinning
    stakingSpinning: {
      id: 'staking-spin',
      contract: 'STAKING' as const,
      functionName: 'createStakePosition',
      args: [parseEther('1000'), 1], // 1000 cUSD, Bronze tier
      value: '1000',
      interval: 5000, // 5 seconds
      count: 3,
      autoWithdraw: true
    },

    // Marketplace offer spinning
    marketplaceSpinning: {
      id: 'marketplace-spin',
      contract: 'MARKETPLACE' as const,
      functionName: 'makeOffer',
      args: [1, parseEther('1500')], // Policy ID 1, 1500 cUSD offer
      value: '1500',
      interval: 4000, // 4 seconds
      count: 3
    }
  }

  const quickSpin = async (type: keyof typeof presetConfigs) => {
    const config = presetConfigs[type]
    await startSpinning([config])
  }

  const clearTransactions = (configId?: string) => {
    if (configId) {
      setActiveTransactions(prev => {
        const newMap = new Map(prev)
        newMap.delete(configId)
        return newMap
      })
    } else {
      setActiveTransactions(new Map())
      setSpinningStats({
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        totalGasUsed: '0',
        totalValueTransacted: '0'
      })
    }
  }

  // Monitor transaction receipts
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: writeData,
  })

  useEffect(() => {
    if (receipt) {
      // Update transaction status
      setActiveTransactions(prev => {
        const newMap = new Map(prev)
        for (const [configId, transactions] of prev.entries()) {
          const updatedTransactions = transactions.map(tx => 
            tx.hash === receipt.transactionHash 
              ? { 
                  ...tx, 
                  status: receipt.status === 'success' ? 'success' : 'failed',
                  gasUsed: receipt.gasUsed?.toString()
                }
              : tx
          )
          newMap.set(configId, updatedTransactions)
        }
        return newMap
      })

      // Update stats
      if (receipt.status === 'success') {
        setSpinningStats(prev => ({
          ...prev,
          successfulTransactions: prev.successfulTransactions + 1,
          totalGasUsed: (
            parseFloat(prev.totalGasUsed) + 
            parseFloat(receipt.gasUsed?.toString() || '0')
          ).toString()
        }))
      }

      if (receipt.status === 'success') {
        showSuccessToast(`Transaction confirmed! Hash: ${receipt.transactionHash.slice(0, 10)}...`)
      } else {
        showErrorToast('Transaction failed')
      }
    }
  }, [receipt])

  return {
    // Spinning controls
    isSpinning,
    startSpinning,
    stopSpinning,
    quickSpin,
    clearTransactions,
    
    // Data
    activeTransactions,
    spinningStats,
    getTransactionStatus,
    
    // Presets
    presetConfigs,
    
    // Transaction execution
    executeTransaction,
    executeAutoWithdraw
  }
}
