import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Target,
  Zap,
  Clock,
  Award
} from 'lucide-react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  showValue?: boolean;
  animated?: boolean;
  striped?: boolean;
  color?: string;
  className?: string;
}

interface Milestone {
  value: number;
  label: string;
  achieved?: boolean;
  icon?: React.ComponentType<any>;
}

interface AdvancedProgressBarProps extends ProgressBarProps {
  milestones?: Milestone[];
  showMilestones?: boolean;
  targetValue?: number;
  previousValue?: number;
  timeRemaining?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  description,
  variant = 'default',
  size = 'md',
  showPercentage = true,
  showValue = false,
  animated = true,
  striped = false,
  color,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const getVariantColor = () => {
    if (color) return color;
    
    switch (variant) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'danger': return 'bg-red-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-blue-600';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-2';
      case 'lg': return 'h-6';
      default: return 'h-4';
    }
  };

  const getStatusIcon = () => {
    switch (variant) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'danger': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'info': return <Target className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {(label || description) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {label && <span className="font-medium text-sm">{label}</span>}
            {description && <span className="text-sm text-gray-500">{description}</span>}
          </div>
          <div className="flex items-center gap-2">
            {showValue && (
              <span className="text-sm font-medium">
                {value} / {max}
              </span>
            )}
            {showPercentage && (
              <Badge variant="outline" className="text-xs">
                {percentage.toFixed(1)}%
              </Badge>
            )}
          </div>
        </div>
      )}
      
      <div className="relative">
        <Progress
          value={percentage}
          className={`${getSizeClass()} ${striped ? 'bg-stripes' : ''}`}
        />
        {animated && (
          <div 
            className={`absolute top-0 left-0 h-full ${getVariantColor()} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
};

export const AdvancedProgressBar: React.FC<AdvancedProgressBarProps> = ({
  value,
  max = 100,
  label,
  description,
  variant = 'default',
  size = 'md',
  showPercentage = true,
  showValue = false,
  animated = true,
  striped = false,
  color,
  milestones = [],
  showMilestones = false,
  targetValue,
  previousValue,
  timeRemaining,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const targetPercentage = targetValue ? (targetValue / max) * 100 : 0;
  const trend = previousValue !== undefined ? value - previousValue : 0;

  const getVariantColor = () => {
    if (color) return color;
    
    switch (variant) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'danger': return 'bg-red-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-blue-600';
    }
  };

  const getTrendIcon = () => {
    if (trend === 0) return null;
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getMilestonePosition = (milestoneValue: number) => {
    return (milestoneValue / max) * 100;
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {label && <h3 className="font-semibold">{label}</h3>}
            {getTrendIcon()}
            {trend !== 0 && (
              <Badge variant={trend > 0 ? 'default' : 'destructive'} className="text-xs">
                {trend > 0 ? '+' : ''}{trend}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {timeRemaining && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                {timeRemaining}
              </div>
            )}
            {showValue && (
              <span className="text-sm font-medium">
                {value} / {max}
              </span>
            )}
            {showPercentage && (
              <Badge variant="outline">
                {percentage.toFixed(1)}%
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar with Milestones */}
        <div className="relative mb-4">
          {/* Milestones */}
          {showMilestones && milestones.map((milestone, index) => {
            const position = getMilestonePosition(milestone.value);
            const Icon = milestone.icon || Target;
            
            return (
              <div
                key={index}
                className="absolute top-0 transform -translate-x-1/2"
                style={{ left: `${position}%` }}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 ${
                    milestone.achieved 
                      ? 'text-green-600' 
                      : value >= milestone.value 
                      ? 'text-blue-600' 
                      : 'text-gray-400'
                  }`} />
                  {milestone.achieved && (
                    <CheckCircle className="absolute -top-1 -right-1 w-3 h-3 text-green-600" />
                  )}
                </div>
                <div className="absolute top-6 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="text-xs font-medium text-center">
                    {milestone.label}
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    {milestone.value}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Progress Bar */}
          <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
            {/* Target Line */}
            {targetValue && targetPercentage > percentage && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500"
                style={{ left: `${targetPercentage}%` }}
              />
            )}
            
            {/* Progress Fill */}
            <div
              className={`h-full ${getVariantColor()} transition-all duration-500 ease-out ${
                striped ? 'bg-stripes' : ''
              }`}
              style={{ width: `${percentage}%` }}
            />
            
            {/* Animated Shine Effect */}
            {animated && (
              <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shine" />
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-3">{description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">{value}</div>
            <div className="text-gray-500">Current</div>
          </div>
          {targetValue && (
            <div className="text-center">
              <div className="font-medium">{targetValue}</div>
              <div className="text-gray-500">Target</div>
            </div>
          )}
          <div className="text-center">
            <div className="font-medium">{max - value}</div>
            <div className="text-gray-500">Remaining</div>
          </div>
          <div className="text-center">
            <div className="font-medium">{percentage.toFixed(1)}%</div>
            <div className="text-gray-500">Complete</div>
          </div>
        </div>

        {/* Achieved Milestones */}
        {milestones.filter(m => m.achieved).length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">Achieved Milestones</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {milestones.filter(m => m.achieved).map((milestone, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {milestone.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Specialized progress bars
export const RiskProgressBar: React.FC<{
  value: number;
  max?: number;
  label?: string;
}> = ({ value, max = 100, label }) => {
  const percentage = (value / max) * 100;
  
  const getRiskLevel = () => {
    if (percentage < 30) return { level: 'Low', color: 'bg-green-500', variant: 'default' as const };
    if (percentage < 60) return { level: 'Medium', color: 'bg-yellow-500', variant: 'secondary' as const };
    return { level: 'High', color: 'bg-red-500', variant: 'destructive' as const };
  };

  const risk = getRiskLevel();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && <span className="text-sm font-medium">{label}</span>}
        <Badge variant={risk.variant}>{risk.level} Risk</Badge>
      </div>
      <ProgressBar
        value={value}
        max={max}
        color={risk.color}
        showPercentage={true}
        size="sm"
      />
    </div>
  );
};

export const GoalProgressBar: React.FC<{
  current: number;
  target: number;
  label?: string;
  deadline?: string;
}> = ({ current, target, label, deadline }) => {
  const percentage = (current / target) * 100;
  const isCompleted = current >= target;

  return (
    <AdvancedProgressBar
      value={current}
      max={target}
      label={label}
      variant={isCompleted ? 'success' : 'default'}
      showPercentage={true}
      showValue={true}
      timeRemaining={deadline}
      milestones={[
        { value: target * 0.25, label: '25%', achieved: current >= target * 0.25 },
        { value: target * 0.5, label: '50%', achieved: current >= target * 0.5 },
        { value: target * 0.75, label: '75%', achieved: current >= target * 0.75 },
        { value: target, label: 'Goal', achieved: isCompleted, icon: Target }
      ]}
      showMilestones={true}
    />
  );
};
