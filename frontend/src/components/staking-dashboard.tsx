'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useInsurancePoolStaking, type StakePosition, type StakingTier, type StakerStats, type PoolStats } from '@/hooks/useInsurancePoolStaking'
import { formatEther } from 'viem'
import { Coins, TrendingUp, Clock, Award, Calculator, Wallet, BarChart3 } from 'lucide-react'

const STAKING_TIERS = [
  { id: 1, name: 'Bronze', minAmount: '1000', lockPeriod: '30', rewardRate: '5%', color: 'bg-amber-600' },
  { id: 2, name: 'Silver', minAmount: '5000', lockPeriod: '60', rewardRate: '7.5%', color: 'bg-gray-500' },
  { id: 3, name: 'Gold', minAmount: '10000', lockPeriod: '90', rewardRate: '10%', color: 'bg-yellow-500' },
  { id: 4, name: 'Platinum', minAmount: '50000', lockPeriod: '180', rewardRate: '15%', color: 'bg-purple-600' }
]

export function StakingDashboard() {
  const { 
    createStakePosition,
    extendStakePosition,
    claimRewards,
    withdrawStake,
    getStakePositions,
    getStakerStats,
    getPoolStats,
    calculateRewards,
    getStakingTier,
    isWriting 
  } = useInsurancePoolStaking()

  const [stakePositions, setStakePositions] = useState<StakePosition[]>([])
  const [stakerStats, setStakerStats] = useState<StakerStats | null>(null)
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<StakePosition | null>(null)
  const [calculatedRewards, setCalculatedRewards] = useState<bigint | null>(null)

  const [form, setForm] = useState({
    amount: '',
    tierId: '1'
  })

  useEffect(() => {
    loadStakePositions()
    loadStakerStats()
    loadPoolStats()
  }, [])

  const loadStakePositions = async () => {
    try {
      const positions = await getStakePositions('0x') // Replace with actual user address
      if (positions) {
        setStakePositions(positions)
      }
    } catch (error) {
      console.error('Failed to load stake positions:', error)
    }
  }

  const loadStakerStats = async () => {
    try {
      const stats = await getStakerStats('0x') // Replace with actual user address
      if (stats) {
        setStakerStats(stats)
      }
    } catch (error) {
      console.error('Failed to load staker stats:', error)
    }
  }

  const loadPoolStats = async () => {
    try {
      const stats = await getPoolStats()
      if (stats) {
        setPoolStats(stats)
      }
    } catch (error) {
      console.error('Failed to load pool stats:', error)
    }
  }

  const handleCreateStake = async () => {
    if (!form.amount || !form.tierId) {
      return
    }

    try {
      await createStakePosition(form.amount, Number(form.tierId))
      
      // Reset form
      setForm({ amount: '', tierId: '1' })
      
      // Reload data
      loadStakePositions()
      loadStakerStats()
      loadPoolStats()
    } catch (error) {
      console.error('Failed to create stake position:', error)
    }
  }

  const handleClaimRewards = async (positionId: number) => {
    try {
      await claimRewards(positionId)
      loadStakePositions()
      loadStakerStats()
    } catch (error) {
      console.error('Failed to claim rewards:', error)
    }
  }

  const handleWithdrawStake = async (positionId: number) => {
    try {
      await withdrawStake(positionId)
      loadStakePositions()
      loadStakerStats()
      loadPoolStats()
    } catch (error) {
      console.error('Failed to withdraw stake:', error)
    }
  }

  const handleExtendStake = async (positionId: number) => {
    try {
      await extendStakePosition(positionId)
      loadStakePositions()
    } catch (error) {
      console.error('Failed to extend stake:', error)
    }
  }

  const handleCalculateRewards = async (positionId: number) => {
    try {
      const rewards = await calculateRewards(positionId, '0x') // Replace with actual user address
      if (rewards) {
        setCalculatedRewards(rewards)
      }
    } catch (error) {
      console.error('Failed to calculate rewards:', error)
    }
  }

  const formatPrice = (price: bigint) => {
    return `${parseFloat(formatEther(price)).toFixed(2)} cUSD`
  }

  const formatPercentage = (basisPoints: bigint) => {
    return `${(Number(basisPoints) / 100).toFixed(2)}%`
  }

  const getTierInfo = (tierId: number) => {
    return STAKING_TIERS.find(tier => tier.id === tierId) || STAKING_TIERS[0]
  }

  const getTimeRemaining = (lockPeriod: bigint, stakedAt: bigint) => {
    const endTime = Number(stakedAt) + Number(lockPeriod)
    const now = Math.floor(Date.now() / 1000)
    const remaining = Math.max(0, endTime - now)
    
    if (remaining === 0) return 'Expired'
    
    const days = Math.floor(remaining / (24 * 60 * 60))
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60))
    
    return `${days}d ${hours}h`
  }

  const getProgressPercentage = (lockPeriod: bigint, stakedAt: bigint) => {
    const endTime = Number(stakedAt) + Number(lockPeriod)
    const now = Math.floor(Date.now() / 1000)
    const elapsed = Math.min(now - Number(stakedAt), Number(lockPeriod))
    
    return (elapsed / Number(lockPeriod)) * 100
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Coins className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Insurance Pool Staking</h1>
      </div>

      {/* Pool Stats */}
      {poolStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(poolStats.totalStakedAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(poolStats.totalRewardsAmount)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Stakers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{poolStats.activeStakers.toString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Reward Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(poolStats.currentRewardRate)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="stake" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stake">Stake</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
          <TabsTrigger value="tiers">Staking Tiers</TabsTrigger>
        </TabsList>

        <TabsContent value="stake" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Stake Position</CardTitle>
              <CardDescription>
                Stake cUSD tokens to earn rewards from the insurance pool
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Stake Amount (cUSD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000"
                    value={form.amount}
                    onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tier">Staking Tier</Label>
                  <Select value={form.tierId} onValueChange={(value) => setForm(prev => ({ ...prev, tierId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAKING_TIERS.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Award className={`h-4 w-4 ${tier.color.replace('bg-', 'text-')}`} />
                            <div>
                              <div className="font-semibold">{tier.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Min: {tier.minAmount} cUSD | Rate: {tier.rewardRate}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tier Information */}
              {form.tierId && (
                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {getTierInfo(Number(form.tierId)).name} Tier Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{getTierInfo(Number(form.tierId)).minAmount} cUSD</div>
                        <div className="text-sm text-muted-foreground">Minimum Amount</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{getTierInfo(Number(form.tierId)).lockPeriod} days</div>
                        <div className="text-sm text-muted-foreground">Lock Period</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{getTierInfo(Number(form.tierId)).rewardRate}</div>
                        <div className="text-sm text-muted-foreground">Reward Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button 
                onClick={handleCreateStake}
                className="w-full"
                disabled={!form.amount || !form.tierId || isWriting}
              >
                {isWriting ? 'Creating Position...' : 'Create Stake Position'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          {/* Staker Stats */}
          {stakerStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  My Staking Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatPrice(stakerStats.totalStaked)}</div>
                    <div className="text-sm text-muted-foreground">Total Staked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatPrice(stakerStats.totalRewards)}</div>
                    <div className="text-sm text-muted-foreground">Total Rewards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stakerStats.activePositions.toString()}</div>
                    <div className="text-sm text-muted-foreground">Active Positions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{getTierInfo(Math.round(Number(stakerStats.averageTier))).name}</div>
                    <div className="text-sm text-muted-foreground">Average Tier</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stake Positions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stakePositions.map((position, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Position #{index + 1}</span>
                    <Badge className={getTierInfo(Number(position.tier)).color}>
                      {getTierInfo(Number(position.tier)).name}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Created: {new Date(Number(position.stakedAt) * 1000).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Staked Amount:</span>
                      <span className="font-semibold">{formatPrice(position.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accumulated Rewards:</span>
                      <span className="font-semibold text-green-600">{formatPrice(position.accumulatedRewards)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Remaining:</span>
                      <span className="font-semibold">{getTimeRemaining(position.lockPeriod, position.stakedAt)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span>{getProgressPercentage(position.lockPeriod, position.stakedAt).toFixed(1)}%</span>
                      </div>
                      <Progress value={getProgressPercentage(position.lockPeriod, position.stakedAt)} className="w-full" />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleClaimRewards(index)}
                        disabled={position.accumulatedRewards === 0n}
                      >
                        Claim Rewards
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExtendStake(index)}
                      >
                        Extend
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleWithdrawStake(index)}
                        disabled={getTimeRemaining(position.lockPeriod, position.stakedAt) !== 'Expired'}
                      >
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAKING_TIERS.map((tier) => (
              <Card key={tier.id} className={`border-2 ${tier.id === 4 ? 'border-purple-500' : 'border-transparent'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className={`h-5 w-5 ${tier.color.replace('bg-', 'text-')}`} />
                    {tier.name}
                  </CardTitle>
                  <CardDescription>
                    {tier.rewardRate} Annual Rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{tier.rewardRate}</div>
                      <div className="text-sm text-muted-foreground">Reward Rate</div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Min Amount:</span>
                        <span className="font-semibold">{tier.minAmount} cUSD</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lock Period:</span>
                        <span className="font-semibold">{tier.lockPeriod} days</span>
                      </div>
                    </div>

                    {tier.id === 4 && (
                      <Badge className="w-full justify-center bg-purple-600">
                        Premium Tier
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
