'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  status: 'uploading' | 'processing' | 'compressing' | 'complete';
  progress: number;
  estimatedTimeRemaining?: number;
}

export function ProgressBar({ status, progress, estimatedTimeRemaining }: ProgressBarProps) {
  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading video...';
      case 'processing':
        return 'Processing video...';
      case 'compressing':
        return 'Compressing video...';
      case 'complete':
        return 'Compression complete!';
      default:
        return 'Processing...';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {status !== 'complete' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            <span className="font-medium">{getStatusText()}</span>
          </div>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>

        <Progress value={progress} />

        {estimatedTimeRemaining !== undefined && status === 'compressing' && (
          <p className="text-sm text-gray-500">
            Estimated time remaining: {formatTime(estimatedTimeRemaining)}
          </p>
        )}
      </div>
    </Card>
  );
}
