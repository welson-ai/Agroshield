import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  AlertTriangle, 
  CheckCircle, 
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Info,
  Shield
} from 'lucide-react';
import { formatEther, parseEther } from 'viem';

interface PolicyFormData {
  cropType: string;
  location: string;
  coverageAmount: string;
  duration: number;
  rainfallThreshold: number;
  startDate: string;
  endDate: string;
  description: string;
}

interface PolicyFormProps {
  onSubmit: (data: PolicyFormData) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<PolicyFormData>;
}

const CROP_TYPES = [
  { value: 'wheat', label: 'Wheat', riskFactor: 0.3 },
  { value: 'corn', label: 'Corn', riskFactor: 0.4 },
  { value: 'soybeans', label: 'Soybeans', riskFactor: 0.35 },
  { value: 'rice', label: 'Rice', riskFactor: 0.25 },
  { value: 'cotton', label: 'Cotton', riskFactor: 0.45 },
  { value: 'coffee', label: 'Coffee', riskFactor: 0.5 }
];

const LOCATIONS = [
  { value: 'midwest_usa', label: 'Midwest USA', riskMultiplier: 1.0 },
  { value: 'california', label: 'California', riskMultiplier: 1.2 },
  { value: 'texas', label: 'Texas', riskMultiplier: 1.1 },
  { value: 'brazil', label: 'Brazil', riskMultiplier: 1.3 },
  { value: 'india', label: 'India', riskMultiplier: 1.4 },
  { value: 'africa', label: 'Africa', riskMultiplier: 1.5 }
];

const DURATION_OPTIONS = [
  { value: 90, label: '3 months', multiplier: 1.0 },
  { value: 180, label: '6 months', multiplier: 1.2 },
  { value: 270, label: '9 months', multiplier: 1.4 },
  { value: 365, label: '12 months', multiplier: 1.6 }
];

export const PolicyForm: React.FC<PolicyFormProps> = ({
  onSubmit,
  loading = false,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<PolicyFormData>({
    cropType: '',
    location: '',
    coverageAmount: '',
    duration: 90,
    rainfallThreshold: 50,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Partial<PolicyFormData>>({});
  const [premium, setPremium] = useState<number>(0);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate end date when duration changes
  useEffect(() => {
    if (formData.startDate && formData.duration) {
      const endDate = new Date(formData.startDate);
      endDate.setDate(endDate.getDate() + formData.duration);
      setFormData(prev => ({ ...prev, endDate: endDate.toISOString().split('T')[0] }));
    }
  }, [formData.startDate, formData.duration]);

  // Calculate premium and risk score
  useEffect(() => {
    const calculatePremium = async () => {
      if (!formData.coverageAmount || !formData.cropType || !formData.location) {
        setPremium(0);
        setRiskScore(0);
        return;
      }

      setIsCalculating(true);
      
      try {
        const coverage = parseFloat(formData.coverageAmount);
        const crop = CROP_TYPES.find(c => c.value === formData.cropType);
        const location = LOCATIONS.find(l => l.value === formData.location);
        const duration = DURATION_OPTIONS.find(d => d.value === formData.duration);

        if (crop && location && duration) {
          // Base premium calculation
          const basePremium = coverage * 0.05; // 5% base rate
          
          // Risk factors
          const cropRisk = crop.riskFactor;
          const locationRisk = location.riskMultiplier;
          const durationMultiplier = duration.multiplier;
          const rainfallRisk = formData.rainfallThreshold < 30 ? 1.3 : formData.rainfallThreshold > 70 ? 0.8 : 1.0;
          
          // Total risk score
          const totalRisk = cropRisk * locationRisk * durationMultiplier * rainfallRisk;
          setRiskScore(Math.min(totalRisk * 100, 100));
          
          // Calculate final premium
          const finalPremium = basePremium * totalRisk;
          setPremium(finalPremium);
        }
      } catch (error) {
        console.error('Premium calculation error:', error);
      } finally {
        setIsCalculating(false);
      }
    };

    const timeoutId = setTimeout(calculatePremium, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.coverageAmount, formData.cropType, formData.location, formData.duration, formData.rainfallThreshold]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PolicyFormData> = {};

    if (!formData.cropType) newErrors.cropType = 'Crop type is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.coverageAmount || parseFloat(formData.coverageAmount) <= 0) {
      newErrors.coverageAmount = 'Coverage amount must be greater than 0';
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.rainfallThreshold < 10 || formData.rainfallThreshold > 200) {
      newErrors.rainfallThreshold = 'Rainfall threshold must be between 10mm and 200mm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (score < 60) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Create Insurance Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Crop and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cropType">Crop Type</Label>
                <Select value={formData.cropType} onValueChange={(value) => setFormData(prev => ({ ...prev, cropType: value }))}>
                  <SelectTrigger className={errors.cropType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CROP_TYPES.map(crop => (
                      <SelectItem key={crop.value} value={crop.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{crop.label}</span>
                          <Badge variant="outline" className="ml-2">
                            Risk: {(crop.riskFactor * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cropType && <p className="text-sm text-red-600">{errors.cropType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map(location => (
                      <SelectItem key={location.value} value={location.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{location.label}</span>
                          <Badge variant="outline" className="ml-2">
                            x{location.riskMultiplier}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
              </div>
            </div>

            {/* Coverage Amount and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coverageAmount">Coverage Amount (USD)</Label>
                <Input
                  id="coverageAmount"
                  type="number"
                  step="0.01"
                  min="100"
                  max="100000"
                  value={formData.coverageAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverageAmount: e.target.value }))}
                  className={errors.coverageAmount ? 'border-red-500' : ''}
                  placeholder="1000.00"
                />
                {errors.coverageAmount && <p className="text-sm text-red-600">{errors.coverageAmount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Policy Duration</Label>
                <Select value={formData.duration.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(duration => (
                      <SelectItem key={duration.value} value={duration.value.toString()}>
                        {duration.label} (x{duration.multiplier} premium)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={errors.startDate ? 'border-red-500' : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.startDate && <p className="text-sm text-red-600">{errors.startDate}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  readOnly
                  className="bg-gray-50"
                />
                {errors.endDate && <p className="text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>

            {/* Rainfall Threshold */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="rainfallThreshold">Rainfall Threshold</Label>
                <span className="text-sm text-gray-600">{formData.rainfallThreshold}mm</span>
              </div>
              <Slider
                value={[formData.rainfallThreshold]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, rainfallThreshold: value[0] }))}
                min={10}
                max={200}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10mm (High Risk)</span>
                <span>105mm (Medium)</span>
                <span>200mm (Low Risk)</span>
              </div>
              {errors.rainfallThreshold && <p className="text-sm text-red-600">{errors.rainfallThreshold}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about your farming operation..."
                rows={3}
              />
            </div>

            {/* Premium Calculation */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Premium Calculation</h3>
                  {isCalculating && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Risk Score</p>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-blue-900">{riskScore.toFixed(0)}%</div>
                      <Badge className={riskLevel.bg + ' ' + riskLevel.color}>
                        {riskLevel.level}
                      </Badge>
                    </div>
                    <Progress value={riskScore} className="mt-2 h-2" />
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Annual Premium</p>
                    <div className="text-2xl font-bold text-blue-900">
                      ${premium.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500">
                      ${(premium / 12).toFixed(2)}/month
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Coverage Ratio</p>
                    <div className="text-2xl font-bold text-blue-900">
                      {formData.coverageAmount ? ((premium / parseFloat(formData.coverageAmount)) * 100).toFixed(1) : '0'}%
                    </div>
                    <p className="text-xs text-gray-500">Premium/Coverage</p>
                  </div>
                </div>

                {riskScore > 70 && (
                  <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      High risk detected! Consider increasing rainfall threshold or reducing coverage amount to lower premium.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" disabled={loading}>
                Save as Draft
              </Button>
              <Button type="submit" disabled={loading || !formData.cropType || !formData.location || !formData.coverageAmount}>
                {loading ? 'Creating Policy...' : 'Create Policy'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
