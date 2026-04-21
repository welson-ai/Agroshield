import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Cloud, Droplets, Thermometer, Wind, TrendingUp, Calendar } from 'lucide-react';

interface WeatherData {
  date: string;
  rainfall: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
}

interface WeatherChartProps {
  data: WeatherData[];
  location: string;
  onLocationChange?: (location: string) => void;
  availableLocations?: string[];
}

export const WeatherChart: React.FC<WeatherChartProps> = ({
  data,
  location,
  onLocationChange,
  availableLocations = []
}) => {
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  const [metric, setMetric] = useState<'rainfall' | 'temperature' | 'humidity' | 'windSpeed'>('rainfall');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'rainfall': return <Droplets className="w-4 h-4" />;
      case 'temperature': return <Thermometer className="w-4 h-4" />;
      case 'humidity': return <Cloud className="w-4 h-4" />;
      case 'windSpeed': return <Wind className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'rainfall': return '#3b82f6';
      case 'temperature': return '#ef4444';
      case 'humidity': return '#10b981';
      case 'windSpeed': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getMetricUnit = (metric: string) => {
    switch (metric) {
      case 'rainfall': return 'mm';
      case 'temperature': return '°C';
      case 'humidity': return '%';
      case 'windSpeed': return 'km/h';
      default: return '';
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return data.filter(item => new Date(item.date) >= cutoffDate);
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    return filteredData.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString(),
      [metric]: item[metric]
    }));
  };

  const getStatistics = () => {
    const filteredData = getFilteredData();
    const values = filteredData.map(item => item[metric]);
    
    if (values.length === 0) return { min: 0, max: 0, avg: 0, trend: 'stable' };
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Simple trend calculation
    const recentValues = values.slice(-7);
    const olderValues = values.slice(0, 7);
    const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    const olderAvg = olderValues.reduce((sum, val) => sum + val, 0) / olderValues.length;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvg > olderAvg * 1.1) trend = 'up';
    else if (recentAvg < olderAvg * 0.9) trend = 'down';
    
    return { min, max, avg, trend };
  };

  const stats = getStatistics();
  const chartData = getChartData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm" style={{ color: getMetricColor(metric) }}>
            {metric}: {payload[0].value} {getMetricUnit(metric)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Weather Data - {location}</CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {availableLocations.length > 0 && (
              <Select value={location} onValueChange={onLocationChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Chart Type:</span>
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              Area
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Metric:</span>
            <Button
              variant={metric === 'rainfall' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetric('rainfall')}
            >
              <Droplets className="w-4 h-4 mr-1" />
              Rainfall
            </Button>
            <Button
              variant={metric === 'temperature' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetric('temperature')}
            >
              <Thermometer className="w-4 h-4 mr-1" />
              Temp
            </Button>
            <Button
              variant={metric === 'humidity' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetric('humidity')}
            >
              <Cloud className="w-4 h-4 mr-1" />
              Humidity
            </Button>
            <Button
              variant={metric === 'windSpeed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMetric('windSpeed')}
            >
              <Wind className="w-4 h-4 mr-1" />
              Wind
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Range:</span>
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7D
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30D
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('90d')}
            >
              90D
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {stats.min.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Min {getMetricUnit(metric)}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {stats.max.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Max {getMetricUnit(metric)}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {stats.avg.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Avg {getMetricUnit(metric)}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className={`w-5 h-5 ${
                stats.trend === 'up' ? 'text-green-600' :
                stats.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`} />
              <span className={`text-2xl font-bold ${
                stats.trend === 'up' ? 'text-green-600' :
                stats.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stats.trend === 'up' ? '↑' : stats.trend === 'down' ? '↓' : '→'}
              </span>
            </div>
            <div className="text-sm text-gray-600">Trend</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: getMetricUnit(metric), angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={metric}
                  stroke={getMetricColor(metric)}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={metric.charAt(0).toUpperCase() + metric.slice(1)}
                />
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: getMetricUnit(metric), angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={getMetricColor(metric)}
                  fill={getMetricColor(metric)}
                  fillOpacity={0.3}
                  name={metric.charAt(0).toUpperCase() + metric.slice(1)}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Data Summary */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Calendar className="w-4 h-4" />
            <span>
              Showing {chartData.length} data points for {timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : 'last 90 days'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
