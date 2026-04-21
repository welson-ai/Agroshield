import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Calendar, MapPin, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatEther, parseEther } from 'viem';

interface PolicyCardProps {
  policy: {
    id: string;
    farmer: string;
    cropType: string;
    coverageAmount: string;
    premium: string;
    startDate: string;
    endDate: string;
    location: string;
    status: 'active' | 'expired' | 'claimed';
    rainfallThreshold?: number;
    currentRainfall?: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  onClaim?: (policyId: string) => void;
  onRenew?: (policyId: string) => void;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({ 
  policy, 
  onClaim, 
  onRenew 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const end = new Date(policy.endDate);
      const diff = end.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else {
        setTimeRemaining(`${hours}h`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [policy.endDate]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'claimed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRainfallProgress = () => {
    if (!policy.rainfallThreshold || !policy.currentRainfall) return 0;
    return Math.min((policy.currentRainfall / policy.rainfallThreshold) * 100, 100);
  };

  const formatCurrency = (value: string) => {
    const amount = parseFloat(formatEther(BigInt(value)));
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const canClaim = () => {
    return policy.status === 'active' && 
           policy.rainfallThreshold && 
           policy.currentRainfall && 
           policy.currentRainfall < policy.rainfallThreshold;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Policy #{policy.id}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(policy.status)}>
                {policy.status.toUpperCase()}
              </Badge>
              <Badge className={getRiskColor(policy.riskLevel)}>
                {policy.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>
          </div>
          <Shield className="w-8 h-8 text-green-600" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Policy Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{policy.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{timeRemaining}</span>
            </div>
          </div>
          
          <div className="space-y-2 text-right">
            <div className="text-sm text-gray-600">Coverage</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(policy.coverageAmount)}
            </div>
            <div className="text-sm text-gray-600">
              Premium: {formatCurrency(policy.premium)}
            </div>
          </div>
        </div>

        {/* Rainfall Progress */}
        {policy.rainfallThreshold && policy.currentRainfall && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Rainfall Status</span>
              <span className="text-sm text-gray-600">
                {policy.currentRainfall}mm / {policy.rainfallThreshold}mm
              </span>
            </div>
            <Progress 
              value={getRainfallProgress()} 
              className="h-2"
            />
            {policy.currentRainfall < policy.rainfallThreshold && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <AlertTriangle className="w-4 h-4" />
                <span>Drought conditions detected</span>
              </div>
            )}
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Crop Type:</span>
                <div className="font-medium">{policy.cropType}</div>
              </div>
              <div>
                <span className="text-gray-600">Farmer:</span>
                <div className="font-medium text-xs">
                  {policy.farmer.slice(0, 6)}...{policy.farmer.slice(-4)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Start Date:</span>
                <div className="font-medium">
                  {new Date(policy.startDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span className="text-gray-600">End Date:</span>
                <div className="font-medium">
                  {new Date(policy.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1"
          >
            {isExpanded ? 'Show Less' : 'Show Details'}
          </Button>
          
          {canClaim() && onClaim && (
            <Button
              size="sm"
              onClick={() => onClaim(policy.id)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Claim
            </Button>
          )}
          
          {policy.status === 'expired' && onRenew && (
            <Button
              size="sm"
              onClick={() => onRenew(policy.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Renew
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
