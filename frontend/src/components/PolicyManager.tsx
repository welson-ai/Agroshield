import React, { useState, useEffect } from 'react';
import { useAccount, useContract, useSigner } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { AgroShieldPolicy } from '../../contracts/AgroShieldPolicy';

interface Policy {
  policyId: number;
  farmer: string;
  coverageAmount: string;
  premiumAmount: string;
  rainfallThreshold: number;
  measurementPeriod: number;
  isActive: boolean;
  createdAt: number;
}

interface PolicyFormData {
  coverageAmount: string;
  rainfallThreshold: string;
  measurementPeriod: string;
  cropType: string;
  location: string;
}

/**
 * PolicyManager component - Policy creation and management interface
 * Allows users to create new insurance policies and manage existing ones
 * 
 * @returns JSX.Element - Policy management interface with form and list
 * 
 * @example
 * <PolicyManager />
 */
export const PolicyManager: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [formData, setFormData] = useState<PolicyFormData>({
    coverageAmount: '',
    rainfallThreshold: '',
    measurementPeriod: '',
    cropType: '',
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const contract = useContract({
    address: '0x1234567890123456789012345678901234567890', // Policy contract address
    abi: AgroShieldPolicy.abi,
    signerOrProvider: signer
  });

  useEffect(() => {
    if (isConnected && contract) {
      fetchUserPolicies();
    }
  }, [isConnected, contract]);

  const fetchUserPolicies = async () => {
    try {
      const policyIds = await contract.getFarmerPolicies(address);
      const policyData = await Promise.all(
        policyIds.map(id => contract.getPolicy(id))
      );
      
      const formattedPolicies = policyData.map((policy, index) => ({
        policyId: policyIds[index],
        farmer: policy.farmer,
        coverageAmount: formatEther(policy.coverageAmount),
        premiumAmount: formatEther(policy.premiumAmount),
        rainfallThreshold: policy.rainfallThreshold,
        measurementPeriod: policy.measurementPeriod,
        isActive: policy.isActive,
        createdAt: policy.createdAt
      }));
      
      setPolicies(formattedPolicies);
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!Object.values(formData).every(value => value && parseFloat(value) > 0)) {
      alert('Please fill all fields with valid values');
      return;
    }
    
    setIsLoading(true);
    try {
      const tx = await contract.createPolicy(
        formData.cropType,
        formData.location,
        parseEther(formData.coverageAmount),
        parseInt(formData.rainfallThreshold),
        parseInt(formData.measurementPeriod)
      );
      await tx.wait();
      
      setFormData({
        coverageAmount: '',
        rainfallThreshold: '',
        measurementPeriod: '',
        cropType: '',
        location: ''
      });
      setShowCreateForm(false);
      await fetchUserPolicies();
    } catch (error) {
      console.error('Policy creation error:', error);
      alert('Failed to create policy. Please check your balance and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getPolicyStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  };

  const getPolicyStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Insurance Policies</h2>
          {isConnected && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {showCreateForm ? 'Cancel' : 'Create Policy'}
            </button>
          )}
        </div>

        {/* Create Policy Form */}
        {showCreateForm && (
          <div className="border rounded-lg p-6 mb-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Create New Policy</h3>
            <form onSubmit={handleCreatePolicy} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Crop Type</label>
                <select
                  name="cropType"
                  value={formData.cropType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select crop type</option>
                  <option value="wheat">Wheat</option>
                  <option value="corn">Corn</option>
                  <option value="rice">Rice</option>
                  <option value="soybeans">Soybeans</option>
                  <option value="cotton">Cotton</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Farm location"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Coverage Amount (cUSD)</label>
                <input
                  type="number"
                  name="coverageAmount"
                  value={formData.coverageAmount}
                  onChange={handleInputChange}
                  placeholder="1000"
                  step="0.01"
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Rainfall Threshold (mm)</label>
                <input
                  type="number"
                  name="rainfallThreshold"
                  value={formData.rainfallThreshold}
                  onChange={handleInputChange}
                  placeholder="100"
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Measurement Period (days)</label>
                <input
                  type="number"
                  name="measurementPeriod"
                  value={formData.measurementPeriod}
                  onChange={handleInputChange}
                  placeholder="30"
                  min="1"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Policy...' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Policies List */}
        {isConnected ? (
          <div className="space-y-4">
            {policies.length > 0 ? (
              policies.map((policy) => (
                <div key={policy.policyId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">Policy #{policy.policyId}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPolicyStatusColor(policy.isActive)}`}>
                        {getPolicyStatusText(policy.isActive)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Created: {new Date(policy.createdAt * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Coverage Amount</p>
                      <p className="font-semibold">{policy.coverageAmount} cUSD</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Premium Amount</p>
                      <p className="font-semibold">{policy.premiumAmount} cUSD</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rainfall Threshold</p>
                      <p className="font-semibold">{policy.rainfallThreshold} mm</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Measurement Period</p>
                      <p className="font-semibold">{policy.measurementPeriod} days</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No policies found. Create your first policy to get started.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Please connect your wallet to view and manage policies</p>
          </div>
        )}
      </div>
    </div>
  );
};
