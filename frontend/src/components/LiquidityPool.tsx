import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { AGROSHIELD_CONTRACTS, AGROSHIELD_ABIS } from '@/constants/contracts';

interface PoolStats {
  totalLiquidity: string;
  userDeposits: string;
  userShares: string;
  sharePercentage: string;
}

/**
 * LiquidityPool component - Pool management interface for AgroShield
 * Allows users to deposit/withdraw liquidity and view pool statistics
 * 
 * @returns JSX.Element - Liquidity pool interface with deposit/withdraw forms
 * 
 * @example
 * <LiquidityPool />
 */
export const LiquidityPool: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  
  const [poolStats, setPoolStats] = useState<PoolStats>({
    totalLiquidity: '0',
    userDeposits: '0',
    userShares: '0',
    sharePercentage: '0'
  });
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contract = useContract({
    address: '0x0e40c31eb5e729af7f417dcbe6f2cecb826c5ba6',
    abi: AgroShieldPool.abi,
    signerOrProvider: signer
  });

  useEffect(() => {
    if (isConnected && contract) {
      fetchPoolStats();
    }
  }, [isConnected, contract]);

  const fetchPoolStats = async () => {
    try {
      if (!address) {
        throw new Error('User address not available');
      }
      
      if (!contract) {
        throw new Error('Contract not available');
      }

      const [totalLiquidity, userDeposits, userShares] = await Promise.all([
        contract.totalLiquidity(),
        contract.userDeposits(address),
        contract.userShares(address)
      ]);

      const sharePercentage = totalLiquidity > 0 
        ? ((userShares * 10000) / totalLiquidity).toString()
        : '0';

      setPoolStats({
        totalLiquidity: formatEther(totalLiquidity),
        userDeposits: formatEther(userDeposits),
        userShares: formatEther(userShares),
        sharePercentage: (parseInt(sharePercentage) / 100).toFixed(2)
      });
    } catch (error) {
      console.error('Error fetching pool stats:', error);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    
    setIsLoading(true);
    try {
      const tx = await contract.provideLiquidity(parseEther(depositAmount));
      await tx.wait();
      setDepositAmount('');
      await fetchPoolStats();
    } catch (error) {
      console.error('Deposit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    
    setIsLoading(true);
    try {
      const tx = await contract.withdrawLiquidity(parseEther(withdrawAmount));
      await tx.wait();
      setWithdrawAmount('');
      await fetchPoolStats();
    } catch (error) {
      console.error('Withdraw error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Liquidity Pool</h2>
        
        {/* Pool Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-600">Total Liquidity</h3>
            <p className="text-2xl font-bold text-blue-900">{poolStats.totalLiquidity} cUSD</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-green-600">Your Deposits</h3>
            <p className="text-2xl font-bold text-green-900">{poolStats.userDeposits} cUSD</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-600">Your Shares</h3>
            <p className="text-2xl font-bold text-purple-900">{poolStats.userShares}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-orange-600">Share Percentage</h3>
            <p className="text-2xl font-bold text-orange-900">{poolStats.sharePercentage}%</p>
          </div>
        </div>

        {/* Actions */}
        {isConnected ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposit */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Provide Liquidity</h3>
              <div className="space-y-4">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Amount in cUSD"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
                <button
                  onClick={handleDeposit}
                  disabled={isLoading || !depositAmount}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Deposit cUSD'}
                </button>
              </div>
            </div>

            {/* Withdraw */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Withdraw Liquidity</h3>
              <div className="space-y-4">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Amount of shares"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  step="1"
                  min="0"
                />
                <button
                  onClick={handleWithdraw}
                  disabled={isLoading || !withdrawAmount}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : 'Withdraw Shares'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Please connect your wallet to interact with the liquidity pool</p>
          </div>
        )}
      </div>
    </div>
  );
};
