import ffmpeg from 'fluent-ffmpeg';
import { VideoMetadata } from '@/types';

// Set FFmpeg path
try {
  if (process.env.FFMPEG_PATH) {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
  } else {
    // Use @ffmpeg-installer/ffmpeg if available
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
      ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    } catch {
      // Use system FFmpeg
      console.log('Using system FFmpeg');
    }
  }
} catch (error) {
  console.error('Failed to set FFmpeg path:', error);
}

// Get video metadata
export function getVideoMetadata(inputPath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
      const audioStream = metadata.streams.find((s) => s.codec_type === 'audio');

      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      const duration = metadata.format.duration || 0;
      const width = videoStream.width || 0;
      const height = videoStream.height || 0;
      const fps = eval(videoStream.r_frame_rate || '0') as number;
      const bitrate = metadata.format.bit_rate ? 
        (typeof metadata.format.bit_rate === 'string' ? parseInt(metadata.format.bit_rate) : metadata.format.bit_rate) : 0;
      const codec = videoStream.codec_name || 'unknown';
      const size = metadata.format.size || 0;
      const hasAudio = !!audioStream;

      resolve({
        duration,
        width,
        height,
        fps,
        bitrate,
        codec,
        size,
        hasAudio,
      });
    });
  });
}

// Get estimated output size
export function estimateOutputSize(
  inputSize: number,
  inputBitrate: number,
  outputBitrate: number
): number {
  if (!inputBitrate || !outputBitrate) {
    return inputSize;
  }
  return Math.floor((inputSize * outputBitrate) / inputBitrate);
}

// Format time
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
