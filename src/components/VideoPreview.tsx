'use client';

import { Card } from '@/components/ui/card';

interface VideoPreviewProps {
  title: string;
  videoSrc?: string;
  metadata?: {
    duration: number;
    width: number;
    height: number;
    fps: number;
    bitrate: number;
    size: number;
  };
}

export function VideoPreview({ title, videoSrc, metadata }: VideoPreviewProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatBitrate = (bitrate: number) => {
    if (bitrate > 1000000) {
      return (bitrate / 1000000).toFixed(2) + ' Mbps';
    }
    return (bitrate / 1000).toFixed(2) + ' kbps';
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      {videoSrc && (
        <video
          src={videoSrc}
          controls
          className="w-full rounded-lg mb-4"
          style={{ maxHeight: '300px' }}
        />
      )}

      {metadata && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Duration:</span>
            <span className="font-medium">{formatTime(metadata.duration)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Resolution:</span>
            <span className="font-medium">
              {metadata.width}x{metadata.height}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Frame Rate:</span>
            <span className="font-medium">{metadata.fps.toFixed(2)} fps</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Bitrate:</span>
            <span className="font-medium">{formatBitrate(metadata.bitrate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">File Size:</span>
            <span className="font-medium">{formatFileSize(metadata.size)}</span>
          </div>
        </div>
      )}

      {!videoSrc && !metadata && (
        <div className="text-center py-12 text-gray-400">No video to display</div>
      )}
    </Card>
  );
}
