import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw,
  Calendar,
  Timer,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface CountdownTimerProps {
  targetDate: Date | string;
  title?: string;
  description?: string;
  onComplete?: () => void;
  showControls?: boolean;
  variant?: 'default' | 'compact' | 'card' | 'badge';
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isExpired: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  title = 'Countdown',
  description,
  onComplete,
  showControls = false,
  variant = 'default',
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    isExpired: false
  });
  const [isActive, setIsActive] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
    const now = new Date();
    const difference = target.getTime() - now.getTime();

    if (difference <= 0) {
      const expiredState = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        isExpired: true
      };
      
      if (!isCompleted) {
        setIsCompleted(true);
        onComplete?.();
      }
      
      return expiredState;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      total: difference,
      isExpired: false
    };
  }, [targetDate, isCompleted, onComplete]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, calculateTimeLeft]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
  }, [calculateTimeLeft]);

  const handleReset = () => {
    setIsCompleted(false);
    setIsActive(true);
    setTimeLeft(calculateTimeLeft());
  };

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  const getTimeColor = () => {
    if (timeLeft.isExpired) return 'text-red-600';
    if (timeLeft.total < 60000) return 'text-red-600'; // Less than 1 minute
    if (timeLeft.total < 3600000) return 'text-yellow-600'; // Less than 1 hour
    if (timeLeft.total < 86400000) return 'text-blue-600'; // Less than 1 day
    return 'text-green-600';
  };

  const getStatusBadge = () => {
    if (timeLeft.isExpired) return { variant: 'destructive' as const, text: 'Expired', icon: AlertTriangle };
    if (timeLeft.total < 60000) return { variant: 'destructive' as const, text: 'Critical', icon: AlertTriangle };
    if (timeLeft.total < 3600000) return { variant: 'secondary' as const, text: 'Soon', icon: Clock };
    if (timeLeft.total < 86400000) return { variant: 'default' as const, text: 'Today', icon: Clock };
    return { variant: 'secondary' as const, text: 'Active', icon: CheckCircle };
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Clock className={`w-4 h-4 ${getTimeColor()}`} />
        <span className={`font-mono text-sm ${getTimeColor()}`}>
          {formatNumber(timeLeft.days)}d {formatNumber(timeLeft.hours)}h {formatNumber(timeLeft.minutes)}m
        </span>
        <Badge variant={status.variant} className="text-xs">
          {status.text}
        </Badge>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <Badge variant={status.variant} className={`${className} ${getTimeColor()}`}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {formatNumber(timeLeft.days)}d {formatNumber(timeLeft.hours)}h {formatNumber(timeLeft.minutes)}m
      </Badge>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">{title}</h3>
            </div>
            <Badge variant={status.variant}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.text}
            </Badge>
          </div>
          
          {description && (
            <p className="text-sm text-gray-600 mb-4">{description}</p>
          )}
          
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-gray-50 rounded p-2">
              <div className={`text-2xl font-bold ${getTimeColor()}`}>
                {formatNumber(timeLeft.days)}
              </div>
              <div className="text-xs text-gray-500">Days</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className={`text-2xl font-bold ${getTimeColor()}`}>
                {formatNumber(timeLeft.hours)}
              </div>
              <div className="text-xs text-gray-500">Hours</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className={`text-2xl font-bold ${getTimeColor()}`}>
                {formatNumber(timeLeft.minutes)}
              </div>
              <div className="text-xs text-gray-500">Minutes</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className={`text-2xl font-bold ${getTimeColor()}`}>
                {formatNumber(timeLeft.seconds)}
              </div>
              <div className="text-xs text-gray-500">Seconds</div>
            </div>
          </div>
          
          {showControls && (
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={handleToggle}>
                {isActive ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {isActive ? 'Pause' : 'Resume'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600" />
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
        <Badge variant={status.variant}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {status.text}
        </Badge>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getTimeColor()}`}>
              {formatNumber(timeLeft.days)}
            </div>
            <div className="text-sm text-gray-500">Days</div>
          </div>
          <div className="text-2xl text-gray-400">:</div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getTimeColor()}`}>
              {formatNumber(timeLeft.hours)}
            </div>
            <div className="text-sm text-gray-500">Hours</div>
          </div>
          <div className="text-2xl text-gray-400">:</div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getTimeColor()}`}>
              {formatNumber(timeLeft.minutes)}
            </div>
            <div className="text-sm text-gray-500">Minutes</div>
          </div>
          <div className="text-2xl text-gray-400">:</div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getTimeColor()}`}>
              {formatNumber(timeLeft.seconds)}
            </div>
            <div className="text-sm text-gray-500">Seconds</div>
          </div>
        </div>
      </div>
      
      {showControls && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleToggle}>
            {isActive ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {isActive ? 'Pause' : 'Resume'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
};

// Hook for easy countdown usage
export const useCountdown = (targetDate: Date | string, onComplete?: () => void) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
    isExpired: false
  });

  const calculateTimeLeft = useCallback(() => {
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
    const now = new Date();
    const difference = target.getTime() - now.getTime();

    if (difference <= 0) {
      onComplete?.();
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        isExpired: true
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      total: difference,
      isExpired: false
    };
  }, [targetDate, onComplete]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
  }, [calculateTimeLeft]);

  return timeLeft;
};
