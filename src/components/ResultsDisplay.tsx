'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle } from 'lucide-react';
import { CompressionResult } from '@/types';

interface ResultsDisplayProps {
  result: CompressionResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = () => {
    window.location.href = result.downloadUrl;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-3 text-green-600 dark:text-green-500">
          <CheckCircle className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Compression Complete!</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Original</h4>
            <div className="text-2xl font-bold">{formatFileSize(result.original.size)}</div>
            <div className="text-sm text-gray-500">
              {result.original.width}x{result.original.height}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-500">Compressed</h4>
            <div className="text-2xl font-bold text-primary">
              {formatFileSize(result.compressed.size)}
            </div>
            <div className="text-sm text-gray-500">
              {result.compressed.width}x{result.compressed.height}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Compression Ratio:</span>
            <span className="font-medium">{result.compressionRatio}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Space Saved:</span>
            <span className="font-medium text-green-600 dark:text-green-500">
              {formatFileSize(result.spaceSaved)}
            </span>
          </div>
        </div>

        <Button onClick={handleDownload} className="w-full" size="lg">
          <Download className="mr-2 h-4 w-4" />
          Download Compressed Video
        </Button>
      </div>
    </Card>
  );
}
