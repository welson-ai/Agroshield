import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  CandlestickChart,
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
  DollarSign, 
  Activity,
  Clock,
  BarChart3,
  RefreshCw,
  Download
} from 'lucide-react';

interface PriceData {
  timestamp: string;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

interface PriceChartProps {
  data: PriceData[];
  symbol: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  onRefresh?: () => void;
  onExport?: () => void;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  symbol,
  currentPrice,
  priceChange,
  priceChangePercent,
  onRefresh,
  onExport
}) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'candlestick'>('line');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d' | '90d'>('24h');
  const [showVolume, setShowVolume] = useState(true);

  // Filter and process data based on time range
  const processedData = useMemo(() => {
    const now = new Date();
    let cutoffTime: Date;

    switch (timeRange) {
      case '1h':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return data
      .filter(item => new Date(item.timestamp) >= cutoffTime)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(item => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString('en', { 
          hour: '2-digit', 
          minute: '2-digit',
          ...(timeRange === '7d' || timeRange === '30d' || timeRange === '90d' ? { month: 'short', day: 'numeric' } : {})
        })
      }));
  }, [data, timeRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (processedData.length === 0) {
      return {
        high: 0,
        low: 0,
        average: 0,
        volume: 0,
        volatility: 0
      };
    }

    const prices = processedData.map(d => d.price);
    const volumes = processedData.map(d => d.volume);
    
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const volume = volumes.reduce((sum, vol) => sum + vol, 0);
    
    // Calculate volatility (standard deviation)
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - average, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance);

    return { high, low, average, volume, volatility };
  }, [processedData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Volume') ? formatVolume(entry.value) : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CandlestickTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{data.time}</p>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-600">Open:</span> {formatCurrency(data.open)}</p>
            <p><span className="text-gray-600">High:</span> {formatCurrency(data.high)}</p>
            <p><span className="text-gray-600">Low:</span> {formatCurrency(data.low)}</p>
            <p><span className="text-gray-600">Close:</span> {formatCurrency(data.close)}</p>
            <p><span className="text-gray-600">Volume:</span> {formatVolume(data.volume)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCandlestick = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis yAxisId="left" domain={['dataMin - 0.001', 'dataMax + 0.001']} />
          {showVolume && (
            <YAxis yAxisId="right" orientation="right" />
          )}
          <Tooltip content={<CandlestickTooltip />} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="high"
            stroke="#10b981"
            strokeWidth={1}
            dot={false}
            name="High"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="low"
            stroke="#ef4444"
            strokeWidth={1}
            dot={false}
            name="Low"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="close"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Price"
          />
          {showVolume && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="volume"
              stroke="#f59e0b"
              strokeWidth={1}
              dot={false}
              name="Volume"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* Price Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{symbol}</h2>
                <Badge variant={priceChange >= 0 ? 'default' : 'destructive'}>
                  {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold">{formatCurrency(currentPrice)}</div>
                <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {priceChange >= 0 ? '+' : ''}{formatCurrency(priceChange)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              )}
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
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
                  <SelectItem value="candlestick">Candlestick</SelectItem>
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
                  <SelectItem value="1h">1H</SelectItem>
                  <SelectItem value="24h">24H</SelectItem>
                  <SelectItem value="7d">7D</SelectItem>
                  <SelectItem value="30d">30D</SelectItem>
                  <SelectItem value="90d">90D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showVolume"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showVolume" className="text-sm text-gray-600">
                Show Volume
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">24h High</p>
                <p className="text-lg font-bold">{formatCurrency(statistics.high)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">24h Low</p>
                <p className="text-lg font-bold">{formatCurrency(statistics.low)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Average</p>
                <p className="text-lg font-bold">{formatCurrency(statistics.average)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Volume</p>
                <p className="text-lg font-bold">{formatVolume(statistics.volume)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Volatility</p>
                <p className="text-lg font-bold">{statistics.volatility.toFixed(4)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Price Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            {chartType === 'candlestick' ? (
              renderCandlestick()
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" domain={['dataMin - 0.001', 'dataMax + 0.001']} />
                    {showVolume && (
                      <YAxis yAxisId="right" orientation="right" />
                    )}
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name="Price"
                    />
                    {showVolume && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="volume"
                        stroke="#f59e0b"
                        strokeWidth={1}
                        dot={false}
                        name="Volume"
                      />
                    )}
                    <ReferenceLine y={currentPrice} stroke="#ef4444" strokeDasharray="5 5" />
                  </LineChart>
                ) : (
                  <AreaChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" domain={['dataMin - 0.001', 'dataMax + 0.001']} />
                    {showVolume && (
                      <YAxis yAxisId="right" orientation="right" />
                    )}
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Price"
                    />
                    {showVolume && (
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="volume"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.3}
                        name="Volume"
                      />
                    )}
                    <ReferenceLine y={currentPrice} stroke="#ef4444" strokeDasharray="5 5" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
