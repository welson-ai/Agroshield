import React, { useState, useEffect } from 'react';
import { useAccount, useContract, useSigner } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { PolicyMarketplace } from '../../contracts/PolicyMarketplace';

interface Listing {
  listingId: number;
  policyId: number;
  seller: string;
  price: string;
  isActive: boolean;
  createdAt: number;
  expiresAt: number;
}

interface Policy {
  policyId: number;
  farmer: string;
  coverageAmount: string;
  premiumAmount: string;
  rainfallThreshold: number;
  measurementPeriod: number;
  isActive: boolean;
}

/**
 * PolicyMarketplace component - Secondary market for policy trading
 * Allows users to buy/sell insurance policies on the open market
 * 
 * @returns JSX.Element - Marketplace interface with listings and trading
 * 
 * @example
 * <PolicyMarketplace />
 */
export const PolicyMarketplace: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [policies, setPolicies] = useState<{ [key: number]: Policy }>({});
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [createListingData, setCreateListingData] = useState({
    policyId: '',
    price: '',
    duration: ''
  });

  const marketplace = useContract({
    address: '0x1234567890123456789012345678901234567890', // Marketplace contract address
    abi: PolicyMarketplace.abi,
    signerOrProvider: signer
  });

  useEffect(() => {
    fetchMarketplaceData();
    const interval = setInterval(fetchMarketplaceData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      const [activeListings, policyIds] = await Promise.all([
        marketplace.getActiveListings(),
        fetchPolicyIds()
      ]);

      const listingData = await Promise.all(
        activeListings.map(id => marketplace.getListing(id))
      );

      const validListings = listingData.filter(listing => 
        listing.isActive && listing.expiresAt > Date.now() / 1000
      );

      setListings(validListings);
      await fetchPolicyDetails(policyIds);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
    }
  };

  const fetchPolicyIds = async () => {
    // Mock implementation - fetch user's policy IDs
    return [1, 2, 3, 4, 5];
  };

  const fetchPolicyDetails = async (policyIds: number[]) => {
    try {
      const policyData = await Promise.all(
        policyIds.map(id => marketplace.getPolicyDetails(id))
      );
      
      const policyMap = policyData.reduce((acc, policy, index) => {
        acc[policyIds[index]] = policy;
        return acc;
      }, {} as { [key: number]: Policy });
      
      setPolicies(policyMap);
    } catch (error) {
      console.error('Error fetching policy details:', error);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!Object.values(createListingData).every(value => value && parseFloat(value) > 0)) {
      alert('Please fill all fields with valid values');
      return;
    }
    
    setIsLoading(true);
    try {
      const tx = await marketplace.listPolicy(
        parseInt(createListingData.policyId),
        parseEther(createListingData.price),
        parseInt(createListingData.duration) * 86400 // Convert days to seconds
      );
      await tx.wait();
      
      setCreateListingData({ policyId: '', price: '', duration: '' });
      setShowCreateListing(false);
      await fetchMarketplaceData();
    } catch (error) {
      console.error('Listing creation error:', error);
      alert('Failed to create listing. Please check your policy and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyPolicy = async (listing: Listing) => {
    if (!policies[listing.policyId]) {
      alert('Policy details not available');
      return;
    }

    setIsLoading(true);
    try {
      const tx = await marketplace.buyPolicy(listing.listingId);
      await tx.wait();
      
      setSelectedListing(null);
      await fetchMarketplaceData();
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to purchase policy. Please check your balance and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now() / 1000;
    const remaining = expiresAt - now;
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getStatusColor = (expiresAt: number) => {
    const now = Date.now() / 1000;
    const remaining = expiresAt - now;
    
    if (remaining <= 86400) return 'text-red-600 bg-red-50'; // Less than 1 day
    if (remaining <= 604800) return 'text-yellow-600 bg-yellow-50'; // Less than 7 days
    return 'text-green-600 bg-green-50'; // More than 7 days
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Policy Marketplace</h2>
          {isConnected && (
            <button
              onClick={() => setShowCreateListing(!showCreateListing)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {showCreateListing ? 'Cancel' : 'Create Listing'}
            </button>
          )}
        </div>

        {/* Create Listing Form */}
        {showCreateListing && (
          <div className="border rounded-lg p-6 mb-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Create New Listing</h3>
            <form onSubmit={handleCreateListing} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Policy ID</label>
                <input
                  type="number"
                  value={createListingData.policyId}
                  onChange={(e) => setCreateListingData(prev => ({ ...prev, policyId: e.target.value }))}
                  placeholder="1"
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Price (cUSD)</label>
                <input
                  type="number"
                  value={createListingData.price}
                  onChange={(e) => setCreateListingData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="100"
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Duration (days)</label>
                <input
                  type="number"
                  value={createListingData.duration}
                  onChange={(e) => setCreateListingData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="7"
                  min="1"
                  max="30"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Listing...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => {
            const policy = policies[listing.policyId];
            
            return (
              <div key={listing.listingId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Policy #{listing.policyId}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.expiresAt)}`}>
                      {getTimeRemaining(listing.expiresAt)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{listing.price} cUSD</p>
                  </div>
                </div>

                {policy && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Coverage:</span>
                      <span className="font-semibold">{policy.coverageAmount} cUSD</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rainfall Threshold:</span>
                      <span className="font-semibold">{policy.rainfallThreshold} mm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Period:</span>
                      <span className="font-semibold">{policy.measurementPeriod} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Seller:</span>
                      <span className="font-semibold">
                        {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedListing(listing)}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    View Details
                  </button>
                  
                  {isConnected && listing.seller !== address && (
                    <button
                      onClick={() => handleBuyPolicy(listing)}
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processing...' : 'Buy Policy'}
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-3">
                  Listed: {formatTimestamp(listing.createdAt)} • 
                  Expires: {formatTimestamp(listing.expiresAt)}
                </div>
              </div>
            );
          })}
        </div>

        {listings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No active listings found in the marketplace</p>
          </div>
        )}

        {/* Listing Details Modal */}
        {selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Policy #{selectedListing.policyId} Details</h3>
                <button
                  onClick={() => setSelectedListing(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {policies[selectedListing.policyId] && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Listing Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-semibold">{selectedListing.price} cUSD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seller:</span>
                          <span className="font-semibold">
                            {selectedListing.seller.slice(0, 6)}...{selectedListing.seller.slice(-4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Listed:</span>
                          <span className="font-semibold">{formatTimestamp(selectedListing.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expires:</span>
                          <span className="font-semibold">{formatTimestamp(selectedListing.expiresAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Policy Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Coverage:</span>
                          <span className="font-semibold">{policies[selectedListing.policyId].coverageAmount} cUSD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Premium:</span>
                          <span className="font-semibold">{policies[selectedListing.policyId].premiumAmount} cUSD</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rainfall Threshold:</span>
                          <span className="font-semibold">{policies[selectedListing.policyId].rainfallThreshold} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Measurement Period:</span>
                          <span className="font-semibold">{policies[selectedListing.policyId].measurementPeriod} days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isConnected && selectedListing.seller !== address && (
                    <button
                      onClick={() => handleBuyPolicy(selectedListing)}
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processing Purchase...' : `Buy Policy for ${selectedListing.price} cUSD`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
