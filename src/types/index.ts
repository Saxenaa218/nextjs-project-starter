export interface VideoFile {
  id: string;
  name: string;
  size: number;
  duration?: number;
  path: string;
  mimeType: string;
}

export interface CompressionOptions {
  resolution: 'original' | '1080p' | '720p' | '480p' | '360p';
  quality: 'high' | 'medium' | 'low';
  bitrate?: number; // in kbps
  frameRate: 'original' | '60' | '30' | '24';
  audio: 'keep' | 'remove' | 'reduce';
}

export interface CompressionJob {
  id: string;
  uploadId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  error?: string;
  options: CompressionOptions;
  inputFile: VideoFile;
  outputFile?: VideoFile;
  startedAt?: Date;
  completedAt?: Date;
  estimatedTimeRemaining?: number; // in seconds
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  codec: string;
  size: number;
  hasAudio: boolean;
}

export interface CompressionResult {
  jobId: string;
  original: VideoMetadata;
  compressed: VideoMetadata;
  compressionRatio: number;
  spaceSaved: number; // in bytes
  downloadUrl: string;
}

export interface UploadResponse {
  uploadId: string;
  file: VideoFile;
  metadata: VideoMetadata;
}

export interface CompressRequest {
  uploadId: string;
  options: CompressionOptions;
}

export interface CompressResponse {
  jobId: string;
  status: string;
}

export interface StatusResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  result?: CompressionResult;
}
