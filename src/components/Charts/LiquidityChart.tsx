import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ComposedChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Droplets, 
  Users,
  DollarSign,
  Activity,
  Target,
  AlertTriangle
} from 'lucide-react';

interface LiquidityData {
  timestamp: string;
  totalLiquidity: number;
  userLiquidity: number;
  providerCount: number;
  utilizationRate: number;
  apy: number;
  volume24h: number;
  deposits: number;
  withdrawals: number;
}

interface LiquidityChartProps {
  data: LiquidityData[];
  currentStats: {
    totalLiquidity: number;
    userLiquidity: number;
    providerCount: number;
    utilizationRate: number;
    apy: string;
  };
  onExport?: () => void;
}

export const LiquidityChart: React.FC<LiquidityChartProps> = ({ data, currentStats, onExport }) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'composed'>('area');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [metric, setMetric] = useState<'liquidity' | 'utilization' | 'apy' | 'volume'>('liquidity');

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : timeRange === '30d' ? 720 : 2160;
    const cutoffTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    return data
      .filter(item => new Date(item.timestamp) >= cutoffTime)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(item => ({
        ...item,
        time: new Date(item.timestamp).toLocaleDateString('en', { 
          month: 'short', 
          day: 'numeric',
          hour: timeRange === '24h' ? '2-digit' : undefined
        })
      }));
  }, [data, timeRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (filteredData.length === 0) return {
      totalVolume: 0,
      avgUtilization: 0,
      liquidityChange: 0,
      providerChange: 0,
      netFlow: 0
    };

    const totalVolume = filteredData.reduce((sum, item) => sum + item.volume24h, 0);
    const avgUtilization = filteredData.reduce((sum, item) => sum + item.utilizationRate, 0) / filteredData.length;
    
    const firstData = filteredData[0];
    const lastData = filteredData[filteredData.length - 1];
    const liquidityChange = ((lastData.totalLiquidity - firstData.totalLiquidity) / firstData.totalLiquidity) * 100;
    const providerChange = lastData.providerCount - firstData.providerCount;
    const netFlow = filteredData.reduce((sum, item) => sum + (item.deposits - item.withdrawals), 0);

    return {
      totalVolume,
      avgUtilization,
      liquidityChange,
      providerChange,
      netFlow
    };
  }, [filteredData]);

  // Liquidity projections
  const projections = useMemo(() => {
    if (filteredData.length < 2) return [];

    const recentData = filteredData.slice(-7);
    const avgDailyChange = recentData.reduce((sum, item, index) => {
      if (index === 0) return 0;
      return sum + (item.totalLiquidity - recentData[index - 1].totalLiquidity);
    }, 0) / (recentData.length - 1);

    const lastData = filteredData[filteredData.length - 1];
    const projections = [];
    
    for (let i = 1; i <= 30; i++) {
      const projectedDate = new Date(lastData.timestamp);
      projectedDate.setDate(projectedDate.getDate() + i);
      
      projections.push({
        time: projectedDate.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        projected: true,
        totalLiquidity: lastData.totalLiquidity + (avgDailyChange * i),
        utilizationRate: Math.min(100, lastData.utilizationRate + (Math.random() - 0.5) * 10)
      });
    }

    return projections;
  }, [filteredData]);

  // Combine actual and projected data
  const chartData = useMemo(() => {
    const combined = [...filteredData];
    
    if (chartType === 'composed' && metric === 'liquidity') {
      combined.push(...projections.slice(0, 7)); // Add 7 days of projections
    }

    return combined;
  }, [filteredData, projections, chartType, metric]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {
                entry.name.includes('Liquidity') || entry.name.includes('Volume') 
                  ? formatCurrency(entry.value) 
                  : entry.name.includes('Rate') || entry.name.includes('APY')
                  ? formatPercentage(entry.value)
                  : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getUtilizationColor = (rate: number) => {
    if (rate < 50) return '#10b981'; // Green
    if (rate < 80) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              Liquidity Analytics
            </CardTitle>
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                Export Data
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Chart Type:</span>
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                  <SelectItem value="composed">Composed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Time Range:</span>
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24H</SelectItem>
                  <SelectItem value="7d">7D</SelectItem>
                  <SelectItem value="30d">30D</SelectItem>
                  <SelectItem value="90d">90D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Metric:</span>
              <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liquidity">Liquidity</SelectItem>
                  <SelectItem value="utilization">Utilization</SelectItem>
                  <SelectItem value="apy">APY</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total Liquidity</p>
                <p className="text-lg font-bold">{formatCurrency(currentStats.totalLiquidity)}</p>
                <div className="flex items-center gap-1">
                  {statistics.liquidityChange >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <span className={`text-xs ${statistics.liquidityChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(statistics.liquidityChange).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Utilization Rate</p>
                <p className="text-lg font-bold">{formatPercentage(currentStats.utilizationRate)}</p>
                <Progress value={currentStats.utilizationRate} className="h-1 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Providers</p>
                <p className="text-lg font-bold">{currentStats.providerCount}</p>
                <div className="flex items-center gap-1">
                  {statistics.providerChange >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <span className={`text-xs ${statistics.providerChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(statistics.providerChange)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Current APY</p>
                <p className="text-lg font-bold">{currentStats.apy}%</p>
                <Badge variant="outline" className="text-xs">
                  {parseFloat(currentStats.apy) > 10 ? 'High' : parseFloat(currentStats.apy) > 5 ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-600" />
              <div>
                <p className="text-xs text-gray-600">24h Volume</p>
                <p className="text-lg font-bold">{formatCurrency(statistics.totalVolume)}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">Net Flow:</span>
                  <span className={`text-xs ${statistics.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {statistics.netFlow >= 0 ? '+' : ''}{formatCurrency(statistics.netFlow)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {metric === 'liquidity' && 'Liquidity Trends'}
            {metric === 'utilization' && 'Utilization Rate'}
            {metric === 'apy' && 'APY Over Time'}
            {metric === 'volume' && 'Trading Volume'}
            {chartType === 'composed' && ' (with Projections)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {metric === 'liquidity' ? (
                chartType === 'composed' ? (
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="totalLiquidity"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Total Liquidity"
                    />
                    <Line
                      type="monotone"
                      dataKey="userLiquidity"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Your Liquidity"
                    />
                    {projections.length > 0 && (
                      <ReferenceLine
                        x={filteredData[filteredData.length - 1]?.time}
                        stroke="#ef4444"
                        strokeDasharray="5 5"
                        label="Projection Start"
                      />
                    )}
                  </ComposedChart>
                ) : chartType === 'line' ? (
                  <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="totalLiquidity" stroke="#3b82f6" strokeWidth={2} name="Total Liquidity" />
                    <Line type="monotone" dataKey="userLiquidity" stroke="#10b981" strokeWidth={2} name="Your Liquidity" />
                  </LineChart>
                ) : (
                  <AreaChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="totalLiquidity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Total Liquidity" />
                    <Area type="monotone" dataKey="userLiquidity" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Your Liquidity" />
                  </AreaChart>
                )
              ) : metric === 'utilization' ? (
                <AreaChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="utilizationRate" 
                    stroke={getUtilizationColor(statistics.avgUtilization)}
                    fill={getUtilizationColor(statistics.avgUtilization)}
                    fillOpacity={0.3} 
                    name="Utilization Rate" 
                  />
                  <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="5 5" label="High Utilization" />
                  <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="5 5" label="Medium Utilization" />
                </AreaChart>
              ) : metric === 'apy' ? (
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="apy" stroke="#8b5cf6" strokeWidth={2} name="APY (%)" />
                </LineChart>
              ) : (
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="volume24h" fill="#06b6d4" name="24h Volume" />
                  <Bar dataKey="deposits" fill="#10b981" name="Deposits" />
                  <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Utilization Warning */}
      {currentStats.utilizationRate > 80 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            High utilization rate detected ({formatPercentage(currentStats.utilizationRate)}). 
            Consider adding more liquidity to maintain optimal pool performance.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
