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
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Filter,
  Download
} from 'lucide-react';

interface PremiumData {
  date: string;
  cropType: string;
  location: string;
  basePremium: number;
  riskFactor: number;
  finalPremium: number;
  coverageAmount: number;
  discount: number;
}

interface PremiumChartProps {
  data: PremiumData[];
  onExport?: () => void;
}

export const PremiumChart: React.FC<PremiumChartProps> = ({ data, onExport }) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Get unique values for filters
  const cropTypes = useMemo(() => {
    const crops = new Set(data.map(d => d.cropType));
    return Array.from(crops);
  }, [data]);

  const locations = useMemo(() => {
    const locs = new Set(data.map(d => d.location));
    return Array.from(locs);
  }, [data]);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Time range filter
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    filtered = filtered.filter(item => new Date(item.date) >= cutoffDate);

    // Crop filter
    if (selectedCrop !== 'all') {
      filtered = filtered.filter(item => item.cropType === selectedCrop);
    }

    // Location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(item => item.location === selectedLocation);
    }

    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data, timeRange, selectedCrop, selectedLocation]);

  // Aggregate data for charts
  const chartData = useMemo(() => {
    const aggregated = new Map<string, any>();

    filteredData.forEach(item => {
      const date = new Date(item.date).toLocaleDateString();
      const existing = aggregated.get(date) || {
        date,
        totalPremium: 0,
        avgRiskFactor: 0,
        totalCoverage: 0,
        totalDiscount: 0,
        count: 0
      };

      existing.totalPremium += item.finalPremium;
      existing.avgRiskFactor += item.riskFactor;
      existing.totalCoverage += item.coverageAmount;
      existing.totalDiscount += item.discount;
      existing.count += 1;

      aggregated.set(date, existing);
    });

    return Array.from(aggregated.values()).map(item => ({
      ...item,
      avgRiskFactor: item.avgRiskFactor / item.count,
      avgPremium: item.totalPremium / item.count
    }));
  }, [filteredData]);

  // Premium distribution by crop type
  const cropDistribution = useMemo(() => {
    const distribution = new Map<string, number>();

    filteredData.forEach(item => {
      const existing = distribution.get(item.cropType) || 0;
      distribution.set(item.cropType, existing + item.finalPremium);
    });

    return Array.from(distribution.entries()).map(([crop, premium]) => ({
      name: crop,
      value: premium,
      percentage: (premium / filteredData.reduce((sum, item) => sum + item.finalPremium, 0)) * 100
    }));
  }, [filteredData]);

  // Risk factor analysis
  const riskAnalysis = useMemo(() => {
    const riskRanges = {
      'Low Risk (0-0.3)': 0,
      'Medium Risk (0.3-0.7)': 0,
      'High Risk (0.7-1.0)': 0
    };

    filteredData.forEach(item => {
      if (item.riskFactor <= 0.3) riskRanges['Low Risk (0-0.3)']++;
      else if (item.riskFactor <= 0.7) riskRanges['Medium Risk (0.3-0.7)']++;
      else riskRanges['High Risk (0.7-1.0)']++;
    });

    return Object.entries(riskRanges).map(([range, count]) => ({
      range,
      count,
      percentage: (count / filteredData.length) * 100
    }));
  }, [filteredData]);

  // Statistics
  const statistics = useMemo(() => {
    if (filteredData.length === 0) return {
      totalPremium: 0,
      avgPremium: 0,
      avgRiskFactor: 0,
      totalCoverage: 0,
      totalDiscount: 0
    };

    const totalPremium = filteredData.reduce((sum, item) => sum + item.finalPremium, 0);
    const avgPremium = totalPremium / filteredData.length;
    const avgRiskFactor = filteredData.reduce((sum, item) => sum + item.riskFactor, 0) / filteredData.length;
    const totalCoverage = filteredData.reduce((sum, item) => sum + item.coverageAmount, 0);
    const totalDiscount = filteredData.reduce((sum, item) => sum + item.discount, 0);

    return {
      totalPremium,
      avgPremium,
      avgRiskFactor,
      totalCoverage,
      totalDiscount
    };
  }, [filteredData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Premium') || entry.name.includes('Coverage') 
                ? formatCurrency(entry.value) 
                : entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Premium Analytics
            </CardTitle>
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
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
                  <SelectItem value="bar">Bar</SelectItem>
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
                  <SelectItem value="7d">7D</SelectItem>
                  <SelectItem value="30d">30D</SelectItem>
                  <SelectItem value="90d">90D</SelectItem>
                  <SelectItem value="1y">1Y</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Crop:</span>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  {cropTypes.map(crop => (
                    <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Location:</span>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total Premium</p>
                <p className="text-lg font-bold">{formatCurrency(statistics.totalPremium)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Avg Premium</p>
                <p className="text-lg font-bold">{formatCurrency(statistics.avgPremium)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Avg Risk Factor</p>
                <p className="text-lg font-bold">{statistics.avgRiskFactor.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Total Coverage</p>
                <p className="text-lg font-bold">{formatCurrency(statistics.totalCoverage)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Total Discount</p>
                <p className="text-lg font-bold">{formatCurrency(statistics.totalDiscount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="avgPremium" stroke="#3b82f6" strokeWidth={2} name="Avg Premium" />
                  <Line type="monotone" dataKey="avgRiskFactor" stroke="#ef4444" strokeWidth={2} name="Risk Factor" />
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="totalPremium" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Total Premium" />
                  <Area type="monotone" dataKey="totalCoverage" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Total Coverage" />
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="totalPremium" fill="#3b82f6" name="Total Premium" />
                  <Bar dataKey="totalDiscount" fill="#ef4444" name="Total Discount" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Premium Distribution by Crop Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cropDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cropDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Factor Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskAnalysis} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="range" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
