import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts';

interface DashboardStats {
  totalLiquidity: string;
  userLiquidity: string;
  totalPolicies: number;
  activePolicies: number;
  totalClaims: number;
  pendingClaims: number;
  averageClaimTime: string;
  successRate: string;
}

interface RecentActivity {
  id: string;
  type: 'deposit' | 'withdrawal' | 'policy' | 'claim';
  description: string;
  amount?: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Dashboard component - Main dashboard for AgroShield protocol
 * Displays user statistics, portfolio health, and recent activity
 * 
 * @returns JSX.Element - The dashboard interface
 */
export const Dashboard: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState<DashboardStats>({
    totalLiquidity: '0',
    userLiquidity: '0',
    totalPolicies: 0,
    activePolicies: 0,
    totalClaims: 0,
    pendingClaims: 0,
    averageClaimTime: '0',
    successRate: '0'
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [isConnected]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Mock implementation - replace with actual contract calls
      const mockStats: DashboardStats = {
        totalLiquidity: '1,234,567.89',
        userLiquidity: '123.45',
        totalPolicies: 1234,
        activePolicies: 856,
        totalClaims: 234,
        pendingClaims: 12,
        averageClaimTime: '2.5',
        successRate: '94.5'
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'deposit',
          description: 'Liquidity provided to pool',
          amount: '50.00',
          timestamp: Date.now() / 1000 - 3600,
          status: 'completed'
        },
        {
          id: '2',
          type: 'policy',
          description: 'New policy created',
          amount: '1,000.00',
          timestamp: Date.now() / 1000 - 7200,
          status: 'completed'
        },
        {
          id: '3',
          type: 'claim',
          description: 'Insurance claim submitted',
          amount: '500.00',
          timestamp: Date.now() / 1000 - 10800,
          status: 'pending'
        },
        {
          id: '4',
          type: 'withdrawal',
          description: 'Liquidity withdrawn from pool',
          amount: '25.00',
          timestamp: Date.now() / 1000 - 14400,
          status: 'completed'
        }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '📥';
      case 'withdrawal': return '📤';
      case 'policy': return '📋';
      case 'claim': return '🛡️';
      default: return '📊';
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {isConnected ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-blue-600">Total Liquidity</h3>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{stats.totalLiquidity} cUSD</p>
                <p className="text-sm text-blue-600 mt-2">Pool-wide liquidity</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-green-600">Your Liquidity</h3>
                  <span className="text-2xl">👤</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{stats.userLiquidity} cUSD</p>
                <p className="text-sm text-green-600 mt-2">Your contribution</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-purple-600">Active Policies</h3>
                  <span className="text-2xl">📋</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{stats.activePolicies}</p>
                <p className="text-sm text-purple-600 mt-2">of {stats.totalPolicies} total</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-orange-600">Success Rate</h3>
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">{stats.successRate}%</p>
                <p className="text-sm text-orange-600 mt-2">Claims success rate</p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border border-gray-200 p-6 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Claims</h3>
                <p className="text-xl font-bold text-gray-900">{stats.totalClaims}</p>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-green-600">Approved: {stats.totalClaims - stats.pendingClaims}</span>
                  <span className="text-yellow-600">Pending: {stats.pendingClaims}</span>
                </div>
              </div>

              <div className="border border-gray-200 p-6 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Avg Claim Time</h3>
                <p className="text-xl font-bold text-gray-900">{stats.averageClaimTime} days</p>
                <p className="text-sm text-gray-500 mt-2">Processing time</p>
              </div>

              <div className="border border-gray-200 p-6 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Pool Utilization</h3>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">65% utilized</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="border rounded-lg">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
              </div>
              
              <div className="divide-y">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{activity.description}</p>
                              {activity.amount && (
                                <p className="text-sm text-gray-600">
                                  Amount: {activity.amount} cUSD
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-medium ${getActivityColor(activity.status)}`}>
                                {activity.status}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTimestamp(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  📥 Provide Liquidity
                </button>
                <button className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  📋 Create Policy
                </button>
                <button className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  🛡️ Submit Claim
                </button>
                <button className="bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                  📊 View Analytics
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Please connect your wallet to view your dashboard</p>
            <button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700">
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
