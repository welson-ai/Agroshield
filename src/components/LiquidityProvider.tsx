import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Droplets, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Percent,
  Users
} from 'lucide-react';
import { formatEther, parseEther } from 'viem';

interface LiquidityProviderProps {
  poolAddress: string;
  userAddress: string;
  poolStats: {
    totalLiquidity: string;
    userLiquidity: string;
    userShares: string;
    apy: string;
    totalProviders: number;
  };
  onProvideLiquidity: (amount: string) => Promise<void>;
  onWithdrawLiquidity: (shares: string) => Promise<void>;
  isLoading?: boolean;
}

export const LiquidityProvider: React.FC<LiquidityProviderProps> = ({
  poolAddress,
  userAddress,
  poolStats,
  onProvideLiquidity,
  onWithdrawLiquidity,
  isLoading = false
}) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');
  const [activeTab, setActiveTab] = useState('deposit');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateDepositAmount = (amount: string): string => {
    if (!amount) return 'Amount is required';
    if (parseFloat(amount) <= 0) return 'Amount must be greater than 0';
    if (parseFloat(amount) > 10000) return 'Amount cannot exceed 10,000 cUSD';
    return '';
  };

  const validateWithdrawShares = (shares: string): string => {
    if (!shares) return 'Shares amount is required';
    if (parseFloat(shares) <= 0) return 'Shares must be greater than 0';
    const userSharesNum = parseFloat(formatEther(BigInt(poolStats.userShares)));
    if (parseFloat(shares) > userSharesNum) return 'Insufficient shares balance';
    return '';
  };

  const handleDeposit = async () => {
    const error = validateDepositAmount(depositAmount);
    if (error) {
      setErrors({ deposit: error });
      return;
    }

    try {
      setErrors({});
      setSuccessMessage('');
      await onProvideLiquidity(depositAmount);
      setSuccessMessage('Liquidity provided successfully!');
      setDepositAmount('');
    } catch (err: any) {
      setErrors({ deposit: err.message || 'Failed to provide liquidity' });
      setSuccessMessage('');
    }
  };

  const handleWithdraw = async () => {
    const error = validateWithdrawShares(withdrawShares);
    if (error) {
      setErrors({ withdraw: error });
      return;
    }

    try {
      setErrors({});
      setSuccessMessage('');
      await onWithdrawLiquidity(withdrawShares);
      setSuccessMessage('Liquidity withdrawn successfully!');
      setWithdrawShares('');
    } catch (err: any) {
      setErrors({ withdraw: err.message || 'Failed to withdraw liquidity' });
      setSuccessMessage('');
    }
  };

  const formatCurrency = (value: string) => {
    const amount = parseFloat(formatEther(BigInt(value)));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getUserLiquidityPercentage = () => {
    const total = parseFloat(formatEther(BigInt(poolStats.totalLiquidity)));
    const user = parseFloat(formatEther(BigInt(poolStats.userLiquidity)));
    return total > 0 ? (user / total) * 100 : 0;
  };

  const getApyColor = (apy: string) => {
    const apyNum = parseFloat(apy);
    if (apyNum >= 10) return 'text-green-600';
    if (apyNum >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Pool Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            Liquidity Pool Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
                <DollarSign className="w-4 h-4" />
                Total Liquidity
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(poolStats.totalLiquidity)}
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-600 mb-1">
                <Users className="w-4 h-4" />
                Your Liquidity
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(poolStats.userLiquidity)}
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-purple-600 mb-1">
                <Percent className="w-4 h-4" />
                Your Shares
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {parseFloat(formatEther(BigInt(poolStats.userShares))).toFixed(2)}
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-orange-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                APY
              </div>
              <div className={`text-2xl font-bold ${getApyColor(poolStats.apy)}`}>
                {poolStats.apy}%
              </div>
            </div>
          </div>

          {/* Your Position */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Your Pool Position</span>
              <Badge variant="secondary">
                {getUserLiquidityPercentage().toFixed(2)}% of pool
              </Badge>
            </div>
            <Progress value={getUserLiquidityPercentage()} className="h-2" />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0%</span>
              <span>{getUserLiquidityPercentage().toFixed(2)}%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liquidity Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Liquidity Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit">Provide Liquidity</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw Liquidity</TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deposit-amount">Amount (cUSD)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="Enter amount to deposit"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="mt-1"
                    disabled={isLoading}
                  />
                  {errors.deposit && (
                    <Alert className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{errors.deposit}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount('100')}
                    disabled={isLoading}
                  >
                    100 cUSD
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount('500')}
                    disabled={isLoading}
                  >
                    500 cUSD
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount('1000')}
                    disabled={isLoading}
                  >
                    1,000 cUSD
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Transaction Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deposit Amount:</span>
                      <span className="font-medium">
                        {depositAmount ? formatCurrency(parseEther(depositAmount)) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Shares:</span>
                      <span className="font-medium">
                        {depositAmount && poolStats.totalLiquidity !== '0' 
                          ? (parseFloat(depositAmount) / parseFloat(formatEther(BigInt(poolStats.totalLiquidity))) * 
                             parseFloat(formatEther(BigInt(poolStats.userShares)))).toFixed(2)
                          : '0.00'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pool Share:</span>
                      <span className="font-medium">
                        {depositAmount && poolStats.totalLiquidity !== '0'
                          ? ((parseFloat(depositAmount) / 
                             (parseFloat(formatEther(BigInt(poolStats.totalLiquidity))) + parseFloat(depositAmount))) * 100).toFixed(2)
                          : '0.00'
                        }%
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleDeposit}
                  disabled={isLoading || !depositAmount}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Droplets className="w-4 h-4 mr-2" />
                      Provide Liquidity
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="withdraw" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="withdraw-shares">Shares to Withdraw</Label>
                  <Input
                    id="withdraw-shares"
                    type="number"
                    placeholder="Enter shares to withdraw"
                    value={withdrawShares}
                    onChange={(e) => setWithdrawShares(e.target.value)}
                    className="mt-1"
                    disabled={isLoading}
                  />
                  {errors.withdraw && (
                    <Alert className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{errors.withdraw}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWithdrawShares(formatEther(BigInt(poolStats.userShares)))}
                    disabled={isLoading}
                  >
                    Max Shares
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setWithdrawShares((parseFloat(formatEther(BigInt(poolStats.userShares))) / 2).toString())}
                    disabled={isLoading}
                  >
                    Half Shares
                  </Button>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">Withdrawal Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shares to Withdraw:</span>
                      <span className="font-medium">
                        {withdrawShares ? parseFloat(withdrawShares).toFixed(2) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected cUSD:</span>
                      <span className="font-medium">
                        {withdrawShares && poolStats.totalLiquidity !== '0' && poolStats.userLiquidity !== '0'
                          ? formatCurrency(
                              (parseFloat(withdrawShares) / parseFloat(formatEther(BigInt(poolStats.userShares)))) * 
                              BigInt(poolStats.userLiquidity)
                            )
                          : '-'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining Shares:</span>
                      <span className="font-medium">
                        {withdrawShares 
                          ? (parseFloat(formatEther(BigInt(poolStats.userShares))) - parseFloat(withdrawShares)).toFixed(2)
                          : formatEther(BigInt(poolStats.userShares))
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleWithdraw}
                  disabled={isLoading || !withdrawShares}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Droplets className="w-4 h-4 mr-2" />
                      Withdraw Liquidity
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Success Message */}
      {successMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Pool Info */}
      <Card>
        <CardHeader>
          <CardTitle>Pool Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Pool Address:</span>
              <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                {poolAddress}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Your Address:</span>
              <div className="font-mono text-xs bg-gray-100 p-2 rounded">
                {userAddress}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Total Providers:</span>
              <div className="font-medium">{poolStats.totalProviders}</div>
            </div>
            <div>
              <span className="text-gray-600">Current APY:</span>
              <div className={`font-medium ${getApyColor(poolStats.apy)}`}>
                {poolStats.apy}% annually
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
