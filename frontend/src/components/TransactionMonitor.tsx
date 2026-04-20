import React, { useState, useEffect } from 'react';
import { useContract } from 'wagmi';
import { formatEther } from 'viem';
import { AgroShieldPool } from '../../contracts/AgroShieldPool';

interface Transaction {
  hash: string;
  type: 'deposit' | 'withdrawal';
  amount: string;
  from: string;
  timestamp: number;
  blockNumber: number;
  gasUsed: string;
  status: 'pending' | 'confirmed' | 'failed';
}

interface PoolStats {
  totalLiquidity: string;
  totalDeposits: number;
  totalWithdrawals: number;
  activeUsers: number;
}

export const TransactionMonitor: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [poolStats, setPoolStats] = useState<PoolStats>({
    totalLiquidity: '0',
    totalDeposits: 0,
    totalWithdrawals: 0,
    activeUsers: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'deposits' | 'withdrawals'>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const pool = useContract({
    address: '0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6',
    abi: AgroShieldPool.abi
  });

  useEffect(() => {
    fetchTransactionData();
    const interval = setInterval(fetchTransactionData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [filter, timeRange]);

  const fetchTransactionData = async () => {
    setIsLoading(true);
    try {
      const [totalLiquidity, events] = await Promise.all([
        pool.totalLiquidity(),
        fetchRecentEvents()
      ]);

      const formattedTransactions = events.map(event => ({
        hash: event.transactionHash,
        type: event.event === 'LiquidityProvided' ? 'deposit' : 'withdrawal',
        amount: formatEther(event.args.amount),
        from: event.args.provider,
        timestamp: event.args.timestamp || Date.now() / 1000,
        blockNumber: event.blockNumber,
        gasUsed: event.gasUsed?.toString() || '0',
        status: 'confirmed'
      }));

      const filteredTransactions = filterTransactionsByType(formattedTransactions);
      const timeFilteredTransactions = filterTransactionsByTime(filteredTransactions);

      setTransactions(timeFilteredTransactions);
      setPoolStats({
        totalLiquidity: formatEther(totalLiquidity),
        totalDeposits: events.filter(e => e.event === 'LiquidityProvided').length,
        totalWithdrawals: events.filter(e => e.event === 'LiquidityWithdrawn').length,
        activeUsers: new Set(events.map(e => e.args.provider)).size
      });
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentEvents = async () => {
    // Mock implementation - in real app, fetch from contract events
    return [
      {
        event: 'LiquidityProvided',
        transactionHash: '0x123...',
        args: {
          provider: '0xabc...',
          amount: '10000000000000000',
          timestamp: Date.now() / 1000
        },
        blockNumber: 12345,
        gasUsed: 75000
      },
      {
        event: 'LiquidityWithdrawn',
        transactionHash: '0x456...',
        args: {
          provider: '0xdef...',
          amount: '5000000000000000',
          timestamp: (Date.now() / 1000) - 3600
        },
        blockNumber: 12344,
        gasUsed: 65000
      }
    ];
  };

  const filterTransactionsByType = (transactions: Transaction[]) => {
    if (filter === 'all') return transactions;
    return transactions.filter(tx => tx.type === filter.slice(0, -1)); // Remove 's' from plural
  };

  const filterTransactionsByTime = (transactions: Transaction[]) => {
    const now = Date.now() / 1000;
    const timeRanges = {
      '1h': 3600,
      '24h': 86400,
      '7d': 604800,
      '30d': 2592000
    };
    
    const cutoff = now - timeRanges[timeRange];
    return transactions.filter(tx => tx.timestamp >= cutoff);
  };

  const getTransactionIcon = (type: string) => {
    return type === 'deposit' ? '📥' : '📤';
  };

  const getTransactionColor = (type: string) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600';
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatGasUsed = (gasUsed: string) => {
    return (parseInt(gasUsed) / 1000).toFixed(1) + 'k';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Transaction Monitor</h2>
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Transactions</option>
              <option value="deposits">Deposits Only</option>
              <option value="withdrawals">Withdrawals Only</option>
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Pool Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-600">Total Liquidity</h3>
            <p className="text-2xl font-bold text-blue-900">{poolStats.totalLiquidity} cUSD</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-green-600">Total Deposits</h3>
            <p className="text-2xl font-bold text-green-900">{poolStats.totalDeposits}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-red-600">Total Withdrawals</h3>
            <p className="text-2xl font-bold text-red-900">{poolStats.totalWithdrawals}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-600">Active Users</h3>
            <p className="text-2xl font-bold text-purple-900">{poolStats.activeUsers}</p>
          </div>
        </div>

        {/* Transaction List */}
        <div className="border rounded-lg">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : (
            <div className="divide-y">
              {transactions.length > 0 ? (
                transactions.map((tx, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getTransactionIcon(tx.type)}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${getTransactionColor(tx.type)}`}>
                              {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                            </span>
                            <span className="text-gray-600">
                              {tx.amount} cUSD
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            From: {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTimestamp(tx.timestamp)} • Block {tx.blockNumber} • {formatGasUsed(tx.gasUsed)} gas
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <a
                          href={`https://celoscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View on CeloScan
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No transactions found for the selected filters</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Status */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-800">
              Live monitoring active • Updates every 10 seconds
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
