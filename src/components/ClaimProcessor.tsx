import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  Camera,
  Eye,
  Download
} from 'lucide-react';
import { formatEther } from 'viem';

interface ClaimProcessorProps {
  policyId: string;
  policyDetails: {
    coverageAmount: string;
    rainfallThreshold: number;
    currentRainfall: number;
    location: string;
    cropType: string;
    endDate: string;
  };
  onSubmitClaim: (claimData: ClaimData) => Promise<void>;
  isLoading?: boolean;
}

interface ClaimData {
  policyId: string;
  claimAmount: string;
  reason: string;
  evidence: File[];
  weatherData: string;
  location: string;
  cropType: string;
  expectedPayout: string;
}

export const ClaimProcessor: React.FC<ClaimProcessorProps> = ({
  policyId,
  policyDetails,
  onSubmitClaim,
  isLoading = false
}) => {
  const [claimData, setClaimData] = useState<ClaimData>({
    policyId,
    claimAmount: '',
    reason: '',
    evidence: [],
    weatherData: '',
    location: policyDetails.location,
    cropType: policyDetails.cropType,
    expectedPayout: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [claimProgress, setClaimProgress] = useState(0);

  useEffect(() => {
    // Calculate expected payout based on rainfall deficit
    if (policyDetails.currentRainfall < policyDetails.rainfallThreshold) {
      const deficit = policyDetails.rainfallThreshold - policyDetails.currentRainfall;
      const deficitPercentage = deficit / policyDetails.rainfallThreshold;
      const expectedPayout = parseFloat(formatEther(BigInt(policyDetails.coverageAmount))) * deficitPercentage;
      
      setClaimData(prev => ({
        ...prev,
        expectedPayout: expectedPayout.toFixed(2),
        claimAmount: expectedPayout.toFixed(2)
      }));
    }
  }, [policyDetails]);

  const validateClaimData = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!claimData.claimAmount || parseFloat(claimData.claimAmount) <= 0) {
      newErrors.claimAmount = 'Claim amount must be greater than 0';
    }

    if (!claimData.reason.trim()) {
      newErrors.reason = 'Reason for claim is required';
    }

    if (claimData.evidence.length === 0) {
      newErrors.evidence = 'At least one evidence file is required';
    }

    if (!claimData.weatherData.trim()) {
      newErrors.weatherData = 'Weather data description is required';
    }

    const maxClaimAmount = parseFloat(formatEther(BigInt(policyDetails.coverageAmount)));
    if (parseFloat(claimData.claimAmount) > maxClaimAmount) {
      newErrors.claimAmount = `Claim amount cannot exceed coverage amount of ${maxClaimAmount.toFixed(2)} cUSD`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({ 
        ...prev, 
        evidence: 'Only images (PNG, JPG) and PDF files up to 5MB are allowed' 
      }));
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    setClaimData(prev => ({ ...prev, evidence: [...prev.evidence, ...validFiles] }));
    
    // Set preview for first image
    if (validFiles.length > 0 && !previewUrl) {
      const firstImage = validFiles.find(file => file.type.startsWith('image/'));
      if (firstImage) {
        setPreviewUrl(URL.createObjectURL(firstImage));
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setClaimData(prev => ({ ...prev, evidence: newFiles }));
    
    // Clear preview if removing the previewed file
    if (previewUrl && newFiles.length === 0) {
      setPreviewUrl('');
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleSubmit = async () => {
    if (!validateClaimData()) return;

    try {
      setErrors({});
      setSuccessMessage('');
      setClaimProgress(0);

      // Simulate claim processing progress
      const progressInterval = setInterval(() => {
        setClaimProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onSubmitClaim(claimData);
      
      clearInterval(progressInterval);
      setClaimProgress(100);
      setSuccessMessage('Claim submitted successfully! Processing will begin shortly.');
      
      // Reset form
      setClaimData({
        policyId,
        claimAmount: '',
        reason: '',
        evidence: [],
        weatherData: '',
        location: policyDetails.location,
        cropType: policyDetails.cropType,
        expectedPayout: ''
      });
      setUploadedFiles([]);
      setPreviewUrl('');
      
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to submit claim' });
      setClaimProgress(0);
    }
  };

  const formatCurrency = (value: string) => {
    const amount = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getClaimStatusColor = () => {
    if (policyDetails.currentRainfall >= policyDetails.rainfallThreshold) {
      return 'text-green-600';
    }
    const deficit = policyDetails.rainfallThreshold - policyDetails.currentRainfall;
    const deficitPercentage = deficit / policyDetails.rainfallThreshold;
    
    if (deficitPercentage >= 0.5) return 'text-red-600';
    if (deficitPercentage >= 0.25) return 'text-orange-600';
    return 'text-yellow-600';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Policy Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Claim Processing - Policy #{policyId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
                <DollarSign className="w-4 h-4" />
                Coverage Amount
              </div>
              <div className="text-xl font-bold text-blue-900">
                {formatCurrency(formatEther(BigInt(policyDetails.coverageAmount)))}
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-orange-600 mb-1">
                <Droplets className="w-4 h-4" />
                Rainfall Status
              </div>
              <div className={`text-xl font-bold ${getClaimStatusColor()}`}>
                {policyDetails.currentRainfall}mm / {policyDetails.rainfallThreshold}mm
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-600 mb-1">
                <MapPin className="w-4 h-4" />
                Location
              </div>
              <div className="text-xl font-bold text-green-900">
                {policyDetails.location}
              </div>
            </div>
          </div>

          {/* Claim Eligibility */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Claim Eligibility</h4>
            <div className="space-y-2">
              {policyDetails.currentRainfall < policyDetails.rainfallThreshold ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Drought conditions detected - Claim eligible</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Sufficient rainfall - Claim not eligible</span>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                Policy ends: {new Date(policyDetails.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claim Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Claim</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Claim Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="claim-amount">Claim Amount (cUSD)</Label>
              <Input
                id="claim-amount"
                type="number"
                step="0.01"
                placeholder="Enter claim amount"
                value={claimData.claimAmount}
                onChange={(e) => setClaimData(prev => ({ ...prev, claimAmount: e.target.value }))}
                disabled={isLoading}
              />
              {errors.claimAmount && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{errors.claimAmount}</AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label htmlFor="expected-payout">Expected Payout (cUSD)</Label>
              <Input
                id="expected-payout"
                type="number"
                step="0.01"
                value={claimData.expectedPayout}
                disabled
                className="bg-gray-50"
              />
              <div className="text-xs text-gray-600 mt-1">
                Calculated based on rainfall deficit
              </div>
            </div>
          </div>

          {/* Claim Reason */}
          <div>
            <Label htmlFor="claim-reason">Reason for Claim</Label>
            <Textarea
              id="claim-reason"
              placeholder="Describe the weather conditions and crop damage..."
              value={claimData.reason}
              onChange={(e) => setClaimData(prev => ({ ...prev, reason: e.target.value }))}
              disabled={isLoading}
              rows={4}
            />
            {errors.reason && (
              <Alert className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.reason}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Weather Data */}
          <div>
            <Label htmlFor="weather-data">Weather Data Description</Label>
            <Textarea
              id="weather-data"
              placeholder="Describe the weather conditions, rainfall measurements, and any relevant weather station data..."
              value={claimData.weatherData}
              onChange={(e) => setClaimData(prev => ({ ...prev, weatherData: e.target.value }))}
              disabled={isLoading}
              rows={3}
            />
            {errors.weatherData && (
              <Alert className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.weatherData}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Evidence Upload */}
          <div>
            <Label htmlFor="evidence-upload">Evidence Files</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload images or PDF files showing crop damage
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Maximum file size: 5MB. Supported formats: PNG, JPG, PDF
              </p>
              <input
                id="evidence-upload"
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('evidence-upload')?.click()}
                disabled={isLoading}
              >
                <Camera className="w-4 h-4 mr-2" />
                Select Files
              </Button>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {file.type.startsWith('image/') && (
                        <Eye 
                          className="w-4 h-4 text-blue-600 cursor-pointer"
                          onClick={() => setPreviewUrl(URL.createObjectURL(file))}
                        />
                      )}
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isLoading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {errors.evidence && (
              <Alert className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.evidence}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* File Preview */}
          {previewUrl && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">File Preview</h4>
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={previewUrl} 
                  alt="Evidence preview" 
                  className="w-full max-h-64 object-contain"
                />
              </div>
            </div>
          )}

          {/* Progress */}
          {claimProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing claim...</span>
                <span>{claimProgress}%</span>
              </div>
              <Progress value={claimProgress} className="h-2" />
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || policyDetails.currentRainfall >= policyDetails.rainfallThreshold}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Processing Claim...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Submit Claim
              </>
            )}
          </Button>

          {errors.submit && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
