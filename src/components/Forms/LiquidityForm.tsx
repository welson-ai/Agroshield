import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent,
  Calculator,
  AlertTriangle,
  Info,
  Wallet,
  Target,
  Clock,
  Shield,
  Zap
} from 'lucide-react';
import { formatEther, parseEther } from 'viem';

interface LiquidityFormData {
  action: 'provide' | 'withdraw';
  amount: string;
  token: 'CELO' | 'cUSD';
  duration: number;
  autoCompound: boolean;
  slippageTolerance: number;
}

interface LiquidityFormProps {
  onSubmit: (data: LiquidityFormData) => Promise<void>;
  loading?: boolean;
  currentStats: {
    totalLiquidity: string;
    userLiquidity: string;
    apy: string;
    utilizationRate: number;
    userBalance: {
      CELO: string;
      cUSD: string;
    };
  };
  poolAddress: string;
}

const DURATION_OPTIONS = [
  { value: 0, label: 'Flexible', multiplier: 1.0, description: 'Withdraw anytime' },
  { value: 30, label: '1 month', multiplier: 1.1, description: '10% bonus APY' },
  { value: 90, label: '3 months', multiplier: 1.2, description: '20% bonus APY' },
  { value: 180, label: '6 months', multiplier: 1.3, description: '30% bonus APY' },
  { value: 365, label: '1 year', multiplier: 1.5, description: '50% bonus APY' }
];

export const LiquidityForm: React.FC<LiquidityFormProps> = ({
  onSubmit,
  loading = false,
  currentStats,
  poolAddress
}) => {
  const [formData, setFormData] = useState<LiquidityFormData>({
    action: 'provide',
    amount: '',
    token: 'cUSD',
    duration: 0,
    autoCompound: true,
    slippageTolerance: 0.5
  });

  const [errors, setErrors] = useState<Partial<LiquidityFormData>>({});
  const [estimatedRewards, setEstimatedRewards] = useState<{
    daily: number;
    monthly: number;
    yearly: number;
  }>({ daily: 0, monthly: 0, yearly: 0 });
  const [gasEstimate, setGasEstimate] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate estimated rewards
  useEffect(() => {
    const calculateRewards = async () => {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setEstimatedRewards({ daily: 0, monthly: 0, yearly: 0 });
        return;
      }

      setIsCalculating(true);
      
      try {
        const amount = parseFloat(formData.amount);
        const baseAPY = parseFloat(currentStats.apy);
        const durationOption = DURATION_OPTIONS.find(d => d.value === formData.duration);
        const multiplier = durationOption?.multiplier || 1.0;
        const effectiveAPY = baseAPY * multiplier;
        
        // Auto-compound bonus
        const compoundBonus = formData.autoCompound ? 1.1 : 1.0;
        const finalAPY = effectiveAPY * compoundBonus;
        
        // Calculate rewards
        const dailyRewards = (amount * finalAPY) / 36500;
        const monthlyRewards = dailyRewards * 30;
        const yearlyRewards = amount * (finalAPY / 100);
        
        setEstimatedRewards({
          daily: dailyRewards,
          monthly: monthlyRewards,
          yearly: yearlyRewards
        });
      } catch (error) {
        console.error('Reward calculation error:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    const timeoutId = setTimeout(calculateRewards, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.amount, formData.duration, formData.autoCompound, currentStats.apy]);

  // Estimate gas costs
  useEffect(() => {
    const estimateGas = async () => {
      try {
        // Mock gas estimation based on action
        const baseGas = formData.action === 'provide' ? 80000 : 100000;
        const gasPrice = 0.00000005; // Current gas price in CELO
        setGasEstimate(baseGas * gasPrice);
      } catch (error) {
        console.error('Gas estimation error:', error);
      }
    };

    estimateGas();
  }, [formData.action]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LiquidityFormData> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    const balance = formData.token === 'CELO' 
      ? parseFloat(currentStats.userBalance.CELO)
      : parseFloat(currentStats.userBalance.cUSD);

    if (parseFloat(formData.amount) > balance) {
      newErrors.amount = `Insufficient ${formData.token} balance`;
    }

    if (formData.action === 'withdraw') {
      const userLiquidity = parseFloat(currentStats.userLiquidity);
      if (parseFloat(formData.amount) > userLiquidity) {
        newErrors.amount = 'Amount exceeds your liquidity position';
      }
    }

    if (formData.slippageTolerance < 0.1 || formData.slippageTolerance > 5) {
      newErrors.slippageTolerance = 'Slippage tolerance must be between 0.1% and 5%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const setMaxAmount = () => {
    if (formData.action === 'provide') {
      const balance = formData.token === 'CELO' 
        ? parseFloat(currentStats.userBalance.CELO)
        : parseFloat(currentStats.userBalance.cUSD);
      setFormData(prev => ({ ...prev, amount: balance.toString() }));
    } else {
      setFormData(prev => ({ ...prev, amount: currentStats.userLiquidity }));
    }
  };

  const getDurationInfo = () => {
    return DURATION_OPTIONS.find(d => d.value === formData.duration);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Liquidity Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Action Selection */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={formData.action === 'provide' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, action: 'provide', amount: '' }))}
                className="h-16 flex flex-col items-center justify-center"
              >
                <TrendingUp className="w-5 h-5 mb-1" />
                <span>Provide Liquidity</span>
              </Button>
              <Button
                type="button"
                variant={formData.action === 'withdraw' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, action: 'withdraw', amount: '' }))}
                className="h-16 flex flex-col items-center justify-center"
              >
                <TrendingDown className="w-5 h-5 mb-1" />
                <span>Withdraw Liquidity</span>
              </Button>
            </div>

            {/* Token Selection and Amount */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Token</Label>
                  <Select value={formData.token} onValueChange={(value: 'CELO' | 'cUSD') => setFormData(prev => ({ ...prev, token: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CELO">
                        <div className="flex items-center justify-between w-full">
                          <span>CELO</span>
                          <Badge variant="outline">Gas Token</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="cUSD">
                        <div className="flex items-center justify-between w-full">
                          <span>cUSD</span>
                          <Badge variant="outline">Stablecoin</Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="amount">Amount</Label>
                    <Button type="button" variant="outline" size="sm" onClick={setMaxAmount}>
                      MAX
                    </Button>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className={errors.amount ? 'border-red-500' : ''}
                    placeholder="0.00"
                  />
                  {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
                  <div className="text-sm text-gray-500">
                    Balance: {formData.token === 'CELO' ? currentStats.userBalance.CELO : currentStats.userBalance.cUSD} {formData.token}
                  </div>
                </div>
              </div>
            </div>

            {/* Duration Selection */}
            {formData.action === 'provide' && (
              <div className="space-y-4">
                <Label>Lock Duration</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {DURATION_OPTIONS.map(duration => (
                    <Card 
                      key={duration.value}
                      className={`cursor-pointer transition-all ${
                        formData.duration === duration.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, duration: duration.value }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{duration.label}</span>
                          {duration.multiplier > 1 && (
                            <Badge variant="secondary">+{((duration.multiplier - 1) * 100).toFixed(0)}%</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{duration.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Options */}
            <div className="space-y-4">
              <Label>Advanced Options</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auto Compound */}
                {formData.action === 'provide' && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="autoCompound" className="text-sm font-medium">Auto Compound</Label>
                      <p className="text-xs text-gray-500">Automatically reinvest rewards for higher returns</p>
                    </div>
                    <Switch
                      id="autoCompound"
                      checked={formData.autoCompound}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoCompound: checked }))}
                    />
                  </div>
                )}

                {/* Slippage Tolerance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slippage">Slippage Tolerance</Label>
                    <span className="text-sm font-medium">{formData.slippageTolerance}%</span>
                  </div>
                  <Slider
                    value={[formData.slippageTolerance]}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, slippageTolerance: value[0] }))}
                    min={0.1}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0.1%</span>
                    <span>5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards Calculation */}
            {formData.action === 'provide' && formData.amount && parseFloat(formData.amount) > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Estimated Rewards</h3>
                    {isCalculating && <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Daily</p>
                      <div className="text-xl font-bold text-green-900">
                        {formatCurrency(estimatedRewards.daily)}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Monthly</p>
                      <div className="text-xl font-bold text-green-900">
                        {formatCurrency(estimatedRewards.monthly)}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Yearly</p>
                      <div className="text-xl font-bold text-green-900">
                        {formatCurrency(estimatedRewards.yearly)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Effective APY</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-900">
                          {((estimatedRewards.yearly / parseFloat(formData.amount)) * 100).toFixed(2)}%
                        </span>
                        <Badge variant="secondary">
                          {getDurationInfo()?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pool Information */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Pool Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Liquidity</span>
                    <div className="font-medium">{formatCurrency(parseFloat(currentStats.totalLiquidity))}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Current APY</span>
                    <div className="font-medium">{currentStats.apy}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Utilization</span>
                    <div className="font-medium">{currentStats.utilizationRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Gas Estimate</span>
                    <div className="font-medium">{gasEstimate.toFixed(6)} CELO</div>
                  </div>
                </div>

                {currentStats.utilizationRate > 80 && (
                  <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      High pool utilization detected. Providing liquidity now may earn higher rewards.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" disabled={loading}>
                Preview Transaction
              </Button>
              <Button type="submit" disabled={loading || !formData.amount}>
                {loading ? 'Processing...' : formData.action === 'provide' ? 'Provide Liquidity' : 'Withdraw Liquidity'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
