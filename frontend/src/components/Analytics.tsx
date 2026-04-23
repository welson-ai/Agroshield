import React, { useState, useEffect } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts';

interface AnalyticsData {
  totalVolume: string;
  totalTransactions: number;
  averageTransactionSize: string;
  gasEfficiency: number;
  userGrowth: number;
  liquidityGrowth: number;
  successRate: number;
  topUsers: Array<{
    address: string;
    volume: string;
    transactions: number;
  }>;
  dailyStats: Array<{
    date: string;
    volume: string;
    transactions: number;
    users: number;
  }>;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }>;
}

/**
 * Analytics component - Comprehensive analytics dashboard with charts
 * Displays protocol metrics, user growth, and transaction analytics
 * 
 * @returns JSX.Element - Analytics dashboard with interactive charts
 * 
 * @example
 * <Analytics />
 */
export const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalVolume: '0',
    totalTransactions: 0,
    averageTransactionSize: '0',
    gasEfficiency: 0,
    userGrowth: 0,
    liquidityGrowth: 0,
    successRate: 0,
    topUsers: [],
    dailyStats: []
  });
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'volume' | 'transactions' | 'users'>('volume');

  const { address } = useAccount();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Mock implementation - replace with actual analytics calls
      const mockData: AnalyticsData = {
        totalVolume: '2,345,678.90',
        totalTransactions: 12345,
        averageTransactionSize: '189.45',
        gasEfficiency: 87.5,
        userGrowth: 23.4,
        liquidityGrowth: 45.6,
        successRate: 94.2,
        topUsers: [
          { address: '0x1234...5678', volume: '123,456.78', transactions: 234 },
          { address: '0xabcd...ef01', volume: '98,765.43', transactions: 189 },
          { address: '0x5678...9012', volume: '87,654.32', transactions: 167 },
          { address: '0xdef0...3456', volume: '76,543.21', transactions: 145 },
          { address: '0x3456...7890', volume: '65,432.10', transactions: 123 }
        ],
        dailyStats: generateDailyStats(timeRange)
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDailyStats = (range: string) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const stats = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      stats.push({
        date: date.toLocaleDateString(),
        volume: (Math.random() * 10000 + 5000).toFixed(2),
        transactions: Math.floor(Math.random() * 50 + 20),
        users: Math.floor(Math.random() * 30 + 10)
      });
    }
    
    return stats;
  };

  const getChartData = (): ChartData => {
    const labels = analyticsData.dailyStats.map(stat => stat.date);
    
    switch (chartType) {
      case 'volume':
        return {
          labels,
          datasets: [{
            label: 'Volume (cUSD)',
            data: analyticsData.dailyStats.map(stat => parseFloat(stat.volume)),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          }]
        };
      case 'transactions':
        return {
          labels,
          datasets: [{
            label: 'Transactions',
            data: analyticsData.dailyStats.map(stat => stat.transactions),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)'
          }]
        };
      case 'users':
        return {
          labels,
          datasets: [{
            label: 'Active Users',
            data: analyticsData.dailyStats.map(stat => stat.users),
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)'
          }]
        };
      default:
        return { labels: [], datasets: [] };
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? '📈' : '📉';
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <div className="flex space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            
            <button
              onClick={fetchAnalyticsData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-600">Total Volume</h3>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{analyticsData.totalVolume} cUSD</p>
            <div className="flex items-center space-x-1 mt-2">
              <span className={getGrowthColor(analyticsData.liquidityGrowth)}>
                {getGrowthIcon(analyticsData.liquidityGrowth)}
              </span>
              <span className={`text-sm ${getGrowthColor(analyticsData.liquidityGrowth)}`}>
                {Math.abs(analyticsData.liquidityGrowth)}%
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-green-600">Total Transactions</h3>
              <span className="text-2xl">🔄</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{analyticsData.totalTransactions.toLocaleString()}</p>
            <div className="flex items-center space-x-1 mt-2">
              <span className={getGrowthColor(analyticsData.userGrowth)}>
                {getGrowthIcon(analyticsData.userGrowth)}
              </span>
              <span className={`text-sm ${getGrowthColor(analyticsData.userGrowth)}`}>
                {Math.abs(analyticsData.userGrowth)}%
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-purple-600">Success Rate</h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{analyticsData.successRate}%</p>
            <div className="text-sm text-purple-600 mt-2">Transaction success rate</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-orange-600">Gas Efficiency</h3>
              <span className="text-2xl">⛽</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">{analyticsData.gasEfficiency}%</p>
            <div className="text-sm text-orange-600 mt-2">Optimization score</div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Performance Trends</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType('volume')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  chartType === 'volume' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Volume
              </button>
              <button
                onClick={() => setChartType('transactions')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  chartType === 'transactions' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setChartType('users')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  chartType === 'users' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Users
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600">Chart visualization would go here</p>
                <p className="text-sm text-gray-500 mt-2">
                  {chartType === 'volume' && 'Daily volume trends over time'}
                  {chartType === 'transactions' && 'Transaction volume patterns'}
                  {chartType === 'users' && 'User activity and growth'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold">Top Users by Volume</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {analyticsData.topUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{formatAddress(user.address)}</div>
                        <div className="text-sm text-gray-600">{user.transactions} transactions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{user.volume} cUSD</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold">Platform Statistics</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Average Transaction Size</span>
                <span className="font-semibold">{analyticsData.averageTransactionSize} cUSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Active Users</span>
                <span className="font-semibold">
                  {analyticsData.dailyStats[analyticsData.dailyStats.length - 1]?.users || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peak Daily Volume</span>
                <span className="font-semibold">
                  {Math.max(...analyticsData.dailyStats.map(stat => parseFloat(stat.volume))).toFixed(2)} cUSD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Daily Transactions</span>
                <span className="font-semibold">
                  {Math.round(
                    analyticsData.dailyStats.reduce((sum, stat) => sum + stat.transactions, 0) / 
                    analyticsData.dailyStats.length
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
