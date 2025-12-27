'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileVideo, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface VideoUploaderProps {
  onUploadComplete: (data: UploadResponse) => void;
  onError: (error: string) => void;
}

interface UploadResponse {
  uploadId: string;
  file: {
    id: string;
    name: string;
    size: number;
    duration?: number;
    path: string;
    mimeType: string;
  };
  metadata: {
    duration: number;
    width: number;
    height: number;
    fps: number;
    bitrate: number;
    size: number;
    hasAudio: boolean;
    codec: string;
  };
}

export function VideoUploader({ onUploadComplete, onError }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
      'video/x-matroska': ['.mkv'],
      'video/webm': ['.webm'],
    },
    maxFiles: 1,
    maxSize: 524288000, // 500MB
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onUploadComplete(response);
        } else {
          const error = JSON.parse(xhr.responseText);
          onError(error.error || 'Upload failed');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        onError('Upload failed. Please try again.');
        setUploading(false);
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch {
      onError('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 dark:border-gray-700 hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg">Drop the video file here...</p>
            ) : (
              <>
                <p className="text-lg mb-2">Drag & drop a video file here</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supports MP4, MOV, AVI, MKV, WEBM (max 500MB)
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileVideo className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              {!uploading && (
                <Button variant="ghost" size="icon" onClick={handleRemove}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {!uploading && uploadProgress === 0 && (
              <Button onClick={handleUpload} className="w-full">
                Upload Video
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
