'use client';

import { useState, useEffect } from 'react';
import { VideoUploader } from '@/components/VideoUploader';
import { CompressionOptions } from '@/components/CompressionOptions';
import { ProgressBar } from '@/components/ProgressBar';
import { VideoPreview } from '@/components/VideoPreview';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { toast } from 'sonner';
import { CompressionOptions as Options, UploadResponse, StatusResponse } from '@/types';

type Stage = 'upload' | 'configure' | 'compressing' | 'complete';

export default function Home() {
  const [stage, setStage] = useState<Stage>('upload');
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Poll for compression status
  useEffect(() => {
    if (jobId && stage === 'compressing') {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/status/${jobId}`);
          const data: StatusResponse = await response.json();
          setStatus(data);

          if (data.status === 'completed') {
            setStage('complete');
            if (pollingInterval) clearInterval(pollingInterval);
            toast.success('Compression complete!');
          } else if (data.status === 'failed') {
            if (pollingInterval) clearInterval(pollingInterval);
            toast.error(data.error || 'Compression failed');
          }
        } catch (error) {
          console.error('Failed to fetch status:', error);
        }
      }, 2000);

      setPollingInterval(interval);

      return () => clearInterval(interval);
    }
  }, [jobId, stage]);

  const handleUploadComplete = (data: UploadResponse) => {
    setUploadData(data);
    setStage('configure');
    toast.success('Video uploaded successfully!');
  };

  const handleUploadError = (error: string) => {
    toast.error(error);
  };

  const handleCompress = async (options: Options) => {
    if (!uploadData) return;

    try {
      const response = await fetch('/api/compress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId: uploadData.uploadId,
          options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to start compression');
        return;
      }

      const data = await response.json();
      setJobId(data.jobId);
      setStage('compressing');
      toast.success('Compression started!');
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Failed to start compression');
    }
  };

  const handleReset = () => {
    setStage('upload');
    setUploadData(null);
    setJobId(null);
    setStatus(null);
    if (pollingInterval) clearInterval(pollingInterval);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Video Compressor
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Compress your videos quickly and easily with advanced options
            </p>
          </div>

          {/* Upload Stage */}
          {stage === 'upload' && (
            <VideoUploader
              onUploadComplete={handleUploadComplete}
              onError={handleUploadError}
            />
          )}

          {/* Configure Stage */}
          {stage === 'configure' && uploadData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Compression Settings</h2>
                <CompressionOptions onCompress={handleCompress} />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Original Video</h2>
                <VideoPreview
                  title="Preview"
                  metadata={uploadData.metadata}
                />
              </div>
            </div>
          )}

          {/* Compressing Stage */}
          {stage === 'compressing' && status && (
            <div className="space-y-6">
              <ProgressBar
                status="compressing"
                progress={status.progress}
                estimatedTimeRemaining={status.result?.original.duration}
              />
            </div>
          )}

          {/* Complete Stage */}
          {stage === 'complete' && status?.result && (
            <div className="space-y-6">
              <ResultsDisplay result={status.result} />

              <div className="flex justify-center">
                <button
                  onClick={handleReset}
                  className="text-primary hover:underline"
                >
                  Compress another video
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
