import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi';
import { celo } from 'wagmi/chains';
import { formatEther } from 'viem';

interface WalletInfo {
  address: string;
  balance: string;
  chain: {
    id: number;
    name: string;
  };
}

export const WalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);

  useEffect(() => {
    if (address && balance) {
      setWalletInfo({
        address,
        balance: formatEther(balance.value),
        chain: {
          id: 42220,
          name: 'Celo'
        }
      });
    } else {
      setWalletInfo(null);
    }
  }, [address, balance]);

  const handleConnect = (connector: any) => {
    connect({ connector });
    setShowDropdown(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  const handleSwitchChain = () => {
    switchChain({ chainId: celo.id });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getConnectorIcon = (connector: any) => {
    switch (connector.id) {
      case 'metaMask':
        return '🦊';
      case 'walletConnect':
        return '🔗';
      case 'coinbaseWallet':
        return '🔵';
      case 'injected':
        return '🌐';
      default:
        return '💼';
    }
  };

  const getConnectorName = (connector: any) => {
    switch (connector.id) {
      case 'metaMask':
        return 'MetaMask';
      case 'walletConnect':
        return 'WalletConnect';
      case 'coinbaseWallet':
        return 'Coinbase Wallet';
      case 'injected':
        return 'Browser Wallet';
      default:
        return connector.name || 'Unknown Wallet';
    }
  };

  if (isConnected && walletInfo) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-3 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {walletInfo.address.slice(2, 4).toUpperCase()}
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900">{formatAddress(walletInfo.address)}</div>
            <div className="text-sm text-gray-600">{parseFloat(walletInfo.balance).toFixed(4)} CELO</div>
          </div>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                  {walletInfo.address.slice(2, 4).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{formatAddress(walletInfo.address)}</div>
                  <div className="text-sm text-gray-600">{parseFloat(walletInfo.balance).toFixed(4)} CELO</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Connected to {walletInfo.chain.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => navigator.clipboard.writeText(walletInfo.address)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm flex items-center space-x-2"
              >
                <span>📋</span>
                <span>Copy Address</span>
              </button>
              
              <button
                onClick={() => window.open(`https://celoscan.io/address/${walletInfo.address}`, '_blank')}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm flex items-center space-x-2"
              >
                <span>🔍</span>
                <span>View on CeloScan</span>
              </button>
              
              <button
                onClick={handleSwitchChain}
                disabled={isSwitching}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm flex items-center space-x-2 disabled:opacity-50"
              >
                <span>🔄</span>
                <span>{isSwitching ? 'Switching...' : 'Switch to Celo'}</span>
              </button>
              
              <hr className="my-2" />
              
              <button
                onClick={handleDisconnect}
                className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-lg text-sm flex items-center space-x-2 text-red-600"
              >
                <span>🔌</span>
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isPending}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        <span>{isPending ? 'Connecting...' : 'Connect Wallet'}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Connect Wallet</h3>
            <p className="text-sm text-gray-600 mt-1">Choose your preferred wallet</p>
          </div>

          <div className="p-2">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => handleConnect(connector)}
                disabled={isPending}
                className="w-full text-left px-3 py-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3 disabled:opacity-50"
              >
                <span className="text-2xl">{getConnectorIcon(connector)}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{getConnectorName(connector)}</div>
                  {connector.id === 'metaMask' && (
                    <div className="text-xs text-gray-500">Most popular</div>
                  )}
                </div>
                {isPending && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t bg-gray-50">
            <div className="text-xs text-gray-600">
              <p className="mb-2">🔒 Secure Connection</p>
              <ul className="space-y-1">
                <li>• Your wallet never leaves your device</li>
                <li>• All transactions require your approval</li>
                <li>• We only request permissions you need</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for mobile */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};
