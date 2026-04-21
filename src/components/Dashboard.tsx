import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Droplets, 
  Shield, 
  Users, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Cloud,
  Sun
} from 'lucide-react';
import { formatEther } from 'viem';

interface DashboardProps {
  userAddress: string;
  poolStats: {
    totalLiquidity: string;
    userLiquidity: string;
    totalPolicies: number;
    activeClaims: number;
    apy: string;
    totalProviders: number;
  };
  weatherData: {
    current: {
      temperature: number;
      humidity: number;
      rainfall: number;
      windSpeed: number;
    };
    forecast: Array<{
      date: string;
      temperature: number;
      rainfall: number;
      condition: string;
    }>;
  };
  userPolicies: Array<{
    id: string;
    cropType: string;
    coverageAmount: string;
    status: 'active' | 'expired' | 'claimed';
    endDate: string;
    rainfallThreshold: number;
    currentRainfall: number;
  }>;
  recentTransactions: Array<{
    hash: string;
    type: 'deposit' | 'withdraw' | 'claim' | 'premium';
    amount: string;
    timestamp: string;
    status: 'pending' | 'completed' | 'failed';
  }>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userAddress,
  poolStats,
  weatherData,
  userPolicies,
  recentTransactions
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [weatherAlert, setWeatherAlert] = useState<string>('');

  useEffect(() => {
    // Check for weather alerts
    const lowRainfallPolicies = userPolicies.filter(
      policy => policy.currentRainfall < policy.rainfallThreshold * 0.5
    );
    
    if (lowRainfallPolicies.length > 0) {
      setWeatherAlert(`${lowRainfallPolicies.length} policy(s) at risk due to low rainfall`);
    } else {
      setWeatherAlert('');
    }
  }, [userPolicies]);

  const formatCurrency = (value: string) => {
    const amount = parseFloat(formatEther(BigInt(value)));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-4 h-4 text-gray-500" />;
      case 'rainy': return <Droplets className="w-4 h-4 text-blue-500" />;
      default: return <Sun className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'withdraw': return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'claim': return <Shield className="w-4 h-4 text-orange-600" />;
      case 'premium': return <DollarSign className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'claimed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPolicyHealthScore = () => {
    if (userPolicies.length === 0) return 100;
    
    const healthyPolicies = userPolicies.filter(
      policy => policy.currentRainfall >= policy.rainfallThreshold * 0.7
    ).length;
    
    return Math.round((healthyPolicies / userPolicies.length) * 100);
  };

  const getRiskLevel = (current: number, threshold: number) => {
    const ratio = current / threshold;
    if (ratio >= 0.8) return { level: 'Low', color: 'text-green-600' };
    if (ratio >= 0.5) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'High', color: 'text-red-600' };
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AgroShield Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Managing {userPolicies.length} active policies
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Your Address</div>
          <div className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </div>
        </div>
      </div>

      {/* Weather Alert */}
      {weatherAlert && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{weatherAlert}</AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Liquidity</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(poolStats.totalLiquidity)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Your Stake</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(poolStats.userLiquidity)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Policies</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userPolicies.filter(p => p.status === 'active').length}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current APY</p>
                    <p className="text-2xl font-bold text-gray-900">{poolStats.apy}%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health & Risk Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Portfolio Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Health Score</span>
                      <span className="font-medium">{getPolicyHealthScore()}%</span>
                    </div>
                    <Progress value={getPolicyHealthScore()} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Healthy Policies</span>
                      <div className="font-medium">
                        {userPolicies.filter(p => p.currentRainfall >= p.rainfallThreshold * 0.7).length}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">At Risk</span>
                      <div className="font-medium text-orange-600">
                        {userPolicies.filter(p => p.currentRainfall < p.rainfallThreshold * 0.5).length}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-600" />
                  Current Weather
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Temperature</span>
                    </div>
                    <div className="text-2xl font-bold">{weatherData.current.temperature}°C</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Rainfall</span>
                    </div>
                    <div className="text-2xl font-bold">{weatherData.current.rainfall}mm</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <div className="text-2xl font-bold">{weatherData.current.humidity}%</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Wind Speed</span>
                    </div>
                    <div className="text-2xl font-bold">{weatherData.current.windSpeed}km/h</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {userPolicies.map((policy) => {
              const risk = getRiskLevel(policy.currentRainfall, policy.rainfallThreshold);
              return (
                <Card key={policy.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">Policy #{policy.id}</h3>
                          <Badge className={getStatusColor(policy.status)}>
                            {policy.status.toUpperCase()}
                          </Badge>
                          <Badge className={risk.color}>
                            {risk.level} RISK
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Crop Type</span>
                            <div className="font-medium">{policy.cropType}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Coverage</span>
                            <div className="font-medium">{formatCurrency(policy.coverageAmount)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Rainfall</span>
                            <div className="font-medium">
                              {policy.currentRainfall}mm / {policy.rainfallThreshold}mm
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Expires</span>
                            <div className="font-medium">
                              {new Date(policy.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Rainfall Progress</span>
                            <span>{Math.round((policy.currentRainfall / policy.rainfallThreshold) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(policy.currentRainfall / policy.rainfallThreshold) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {policy.status === 'active' && policy.currentRainfall < policy.rainfallThreshold && (
                          <Button size="sm" variant="outline">
                            File Claim
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Weather Tab */}
        <TabsContent value="weather" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                Weather Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-600">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <div className="my-2">
                      {getWeatherIcon(day.condition)}
                    </div>
                    <div className="text-lg font-bold">{day.temperature}°C</div>
                    <div className="text-sm text-blue-600">{day.rainfall}mm</div>
                    <div className="text-xs text-gray-600 mt-1">{day.condition}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <div className="font-medium capitalize">{tx.type}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(tx.amount)}</div>
                      <Badge className={getStatusColor(tx.status)} variant="secondary">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
