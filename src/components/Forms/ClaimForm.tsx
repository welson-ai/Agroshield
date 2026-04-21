import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  AlertTriangle, 
  CheckCircle, 
  Calculator,
  Camera,
  X,
  File,
  Eye,
  Download,
  MapPin,
  Calendar,
  DollarSign,
  CloudRain,
  Info
} from 'lucide-react';

interface ClaimFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'document';
  name: string;
  size: number;
}

interface ClaimFormData {
  policyId: string;
  claimType: string;
  incidentDate: string;
  location: string;
  description: string;
  estimatedLoss: string;
  rainfallDeficit: number;
  supportingDocuments: ClaimFile[];
}

interface ClaimFormProps {
  onSubmit: (data: ClaimFormData) => Promise<void>;
  loading?: boolean;
  policies: Array<{
    id: string;
    cropType: string;
    coverageAmount: string;
    rainfallThreshold: number;
    currentRainfall: number;
    endDate: string;
  }>;
}

const CLAIM_TYPES = [
  { value: 'drought', label: 'Drought', icon: CloudRain },
  { value: 'flood', label: 'Flood', icon: CloudRain },
  { value: 'pest_damage', label: 'Pest Damage', icon: AlertTriangle },
  { value: 'disease', label: 'Crop Disease', icon: AlertTriangle },
  { value: 'weather_extreme', label: 'Extreme Weather', icon: CloudRain },
  { value: 'other', label: 'Other', icon: FileText }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'application/msword'];

export const ClaimForm: React.FC<ClaimFormProps> = ({
  onSubmit,
  loading = false,
  policies
}) => {
  const [formData, setFormData] = useState<ClaimFormData>({
    policyId: '',
    claimType: '',
    incidentDate: '',
    location: '',
    description: '',
    estimatedLoss: '',
    rainfallDeficit: 0,
    supportingDocuments: []
  });

  const [errors, setErrors] = useState<Partial<ClaimFormData>>({});
  const [files, setFiles] = useState<ClaimFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimatedPayout, setEstimatedPayout] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPolicy = policies.find(p => p.id === formData.policyId);

  // Calculate estimated payout based on rainfall deficit
  const calculatePayout = useCallback(async () => {
    if (!selectedPolicy || formData.rainfallDeficit <= 0) {
      setEstimatedPayout(0);
      return;
    }

    setIsCalculating(true);
    
    try {
      const coverage = parseFloat(selectedPolicy.coverageAmount);
      const threshold = selectedPolicy.rainfallThreshold;
      const current = selectedPolicy.currentRainfall;
      
      // Calculate rainfall deficit percentage
      const deficitPercentage = Math.max(0, (threshold - current) / threshold);
      
      // Payout calculation based on deficit
      let payoutRatio = 0;
      if (deficitPercentage > 0.8) payoutRatio = 1.0; // 100% payout for >80% deficit
      else if (deficitPercentage > 0.6) payoutRatio = 0.8; // 80% payout for >60% deficit
      else if (deficitPercentage > 0.4) payoutRatio = 0.6; // 60% payout for >40% deficit
      else if (deficitPercentage > 0.2) payoutRatio = 0.4; // 40% payout for >20% deficit
      else payoutRatio = 0.2; // 20% payout for <=20% deficit
      
      const payout = coverage * payoutRatio;
      setEstimatedPayout(payout);
    } catch (error) {
      console.error('Payout calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [selectedPolicy, formData.rainfallDeficit]);

  React.useEffect(() => {
    calculatePayout();
  }, [calculatePayout]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    
    uploadedFiles.forEach(file => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setErrors(prev => ({ 
          ...prev, 
          supportingDocuments: `File ${file.name} exceeds 10MB limit` 
        }));
        return;
      }

      // Validate file type
      const isValidType = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES].includes(file.type);
      if (!isValidType) {
        setErrors(prev => ({ 
          ...prev, 
          supportingDocuments: `File ${file.name} is not a supported format` 
        }));
        return;
      }

      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

      if (isImage) {
        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const claimFile: ClaimFile = {
            id: fileId,
            file,
            preview: e.target?.result as string,
            type: 'image',
            name: file.name,
            size: file.size
          };
          setFiles(prev => [...prev, claimFile]);
        };
        reader.readAsDataURL(file);
      } else {
        // Create document preview
        const claimFile: ClaimFile = {
          id: fileId,
          file,
          preview: '',
          type: 'document',
          name: file.name,
          size: file.size
        };
        setFiles(prev => [...prev, claimFile]);
      }

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }, 200);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<ClaimFormData> = {};

    if (!formData.policyId) newErrors.policyId = 'Policy is required';
    if (!formData.claimType) newErrors.claimType = 'Claim type is required';
    if (!formData.incidentDate) newErrors.incidentDate = 'Incident date is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.estimatedLoss || parseFloat(formData.estimatedLoss) <= 0) {
      newErrors.estimatedLoss = 'Estimated loss must be greater than 0';
    }
    if (files.length === 0) newErrors.supportingDocuments = 'At least one document is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const submissionData = {
        ...formData,
        supportingDocuments: files
      };
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getClaimTypeInfo = (type: string) => {
    return CLAIM_TYPES.find(t => t.value === type);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            File Insurance Claim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Policy Selection */}
            <div className="space-y-2">
              <Label htmlFor="policyId">Select Policy</Label>
              <Select value={formData.policyId} onValueChange={(value) => setFormData(prev => ({ ...prev, policyId: value }))}>
                <SelectTrigger className={errors.policyId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your insurance policy" />
                </SelectTrigger>
                <SelectContent>
                  {policies.map(policy => (
                    <SelectItem key={policy.id} value={policy.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-medium">Policy #{policy.id}</div>
                          <div className="text-sm text-gray-500">{policy.cropType} - ${policy.coverageAmount}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={policy.currentRainfall < policy.rainfallThreshold ? 'destructive' : 'default'}>
                            {policy.currentRainfall < policy.rainfallThreshold ? 'At Risk' : 'Healthy'}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.policyId && <p className="text-sm text-red-600">{errors.policyId}</p>}
            </div>

            {/* Selected Policy Info */}
            {selectedPolicy && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Crop Type:</span>
                      <div className="font-medium">{selectedPolicy.cropType}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Coverage:</span>
                      <div className="font-medium">${selectedPolicy.coverageAmount}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Rainfall:</span>
                      <div className="font-medium">
                        {selectedPolicy.currentRainfall}mm / {selectedPolicy.rainfallThreshold}mm
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Expires:</span>
                      <div className="font-medium">
                        {new Date(selectedPolicy.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Claim Type and Incident Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="claimType">Claim Type</Label>
                <Select value={formData.claimType} onValueChange={(value) => setFormData(prev => ({ ...prev, claimType: value }))}>
                  <SelectTrigger className={errors.claimType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select claim type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLAIM_TYPES.map(type => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.claimType && <p className="text-sm text-red-600">{errors.claimType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="incidentDate">Incident Date</Label>
                <Input
                  id="incidentDate"
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, incidentDate: e.target.value }))}
                  className={errors.incidentDate ? 'border-red-500' : ''}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.incidentDate && <p className="text-sm text-red-600">{errors.incidentDate}</p>}
              </div>
            </div>

            {/* Location and Estimated Loss */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Incident Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className={errors.location ? 'border-red-500' : ''}
                  placeholder="Farm location, field name, etc."
                />
                {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedLoss">Estimated Loss (USD)</Label>
                <Input
                  id="estimatedLoss"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.estimatedLoss}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedLoss: e.target.value }))}
                  className={errors.estimatedLoss ? 'border-red-500' : ''}
                  placeholder="0.00"
                />
                {errors.estimatedLoss && <p className="text-sm text-red-600">{errors.estimatedLoss}</p>}
              </div>
            </div>

            {/* Rainfall Deficit */}
            {selectedPolicy && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>Rainfall Deficit</Label>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Info className="w-3 h-3" />
                    Current: {selectedPolicy.currentRainfall}mm / Required: {selectedPolicy.rainfallThreshold}mm
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Deficit Amount</span>
                    <span className="font-medium">
                      {Math.max(0, selectedPolicy.rainfallThreshold - selectedPolicy.currentRainfall)}mm
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (selectedPolicy.currentRainfall / selectedPolicy.rainfallThreshold) * 100)} 
                    className="h-2" 
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0mm</span>
                    <span>{selectedPolicy.rainfallThreshold}mm</span>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Incident Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={errors.description ? 'border-red-500' : ''}
                placeholder="Please provide detailed information about the incident, including timeline, affected areas, and any immediate actions taken..."
                rows={4}
              />
              {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Supporting Documents</Label>
                <span className="text-sm text-gray-500">Max 10MB per file</span>
              </div>
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  Images (JPEG, PNG, WebP) and Documents (PDF, DOC, TXT)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {errors.supportingDocuments && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {errors.supportingDocuments}
                  </AlertDescription>
                </Alert>
              )}

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Uploaded Files ({files.length})</h4>
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {file.type === 'image' ? (
                          <div className="w-12 h-12 rounded overflow-hidden bg-gray-200">
                            <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                            <File className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {uploadProgress[file.id] !== undefined && uploadProgress[file.id] < 100 && (
                          <div className="w-16">
                            <Progress value={uploadProgress[file.id]} className="h-1" />
                          </div>
                        )}
                        
                        {file.type === 'image' && file.preview && (
                          <Button size="sm" variant="outline" onClick={() => window.open(file.preview, '_blank')}>
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                        
                        <Button size="sm" variant="outline" onClick={() => removeFile(file.id)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payout Calculation */}
            {estimatedPayout > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Estimated Payout</h3>
                    {isCalculating && <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Estimated Amount</p>
                      <div className="text-2xl font-bold text-green-900">
                        ${estimatedPayout.toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-500">
                        Subject to verification and approval
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Payout Ratio</p>
                      <div className="text-2xl font-bold text-green-900">
                        {selectedPolicy ? ((estimatedPayout / parseFloat(selectedPolicy.coverageAmount)) * 100).toFixed(1) : '0'}%
                      </div>
                      <p className="text-xs text-gray-500">
                        Based on rainfall deficit
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" disabled={loading}>
                Save as Draft
              </Button>
              <Button type="submit" disabled={loading || !formData.policyId || files.length === 0}>
                {loading ? 'Submitting Claim...' : 'Submit Claim'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
