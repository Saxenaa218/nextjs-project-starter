import ffmpeg from 'fluent-ffmpeg';
import { CompressionOptions } from '@/types';

// Resolution mapping
const RESOLUTION_MAP: Record<string, { width: number; height: number }> = {
  '1080p': { width: 1920, height: 1080 },
  '720p': { width: 1280, height: 720 },
  '480p': { width: 854, height: 480 },
  '360p': { width: 640, height: 360 },
};

// Quality presets (CRF values)
const QUALITY_PRESETS = {
  high: 20,
  medium: 25,
  low: 30,
};

// Audio bitrate presets
const AUDIO_BITRATES = {
  keep: 192, // Original quality (max)
  reduce: 96, // Reduced quality
  remove: 0, // No audio
};

export interface CompressionProgress {
  progress: number; // 0-100
  currentFps?: number;
  currentKbps?: number;
  targetSize?: number;
  timemark?: string;
}

export function compressVideo(
  inputPath: string,
  outputPath: string,
  options: CompressionOptions,
  onProgress?: (progress: CompressionProgress) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);

    // Set video codec
    command = command.videoCodec('libx264');

    // Set quality (CRF)
    const crf = QUALITY_PRESETS[options.quality];
    command = command.outputOptions(['-crf', crf.toString()]);

    // Set preset for encoding speed/compression ratio
    command = command.outputOptions(['-preset', 'medium']);

    // Set resolution if not original
    if (options.resolution !== 'original') {
      const resolution = RESOLUTION_MAP[options.resolution];
      command = command.size(`${resolution.width}x${resolution.height}`);
    }

    // Set frame rate if not original
    if (options.frameRate !== 'original') {
      command = command.fps(parseInt(options.frameRate));
    }

    // Set bitrate if specified
    if (options.bitrate && options.bitrate > 0) {
      command = command.videoBitrate(`${options.bitrate}k`);
    }

    // Handle audio
    if (options.audio === 'remove') {
      command = command.noAudio();
    } else if (options.audio === 'reduce') {
      command = command.audioCodec('aac').audioBitrate(`${AUDIO_BITRATES.reduce}k`);
    } else {
      // Keep audio with good quality
      command = command.audioCodec('aac').audioBitrate(`${AUDIO_BITRATES.keep}k`);
    }

    // Set output format
    command = command.format('mp4');

    // Add movflags for web playback
    command = command.outputOptions(['-movflags', '+faststart']);

    // Handle progress
    if (onProgress) {
      command.on('progress', (progress) => {
        const percent = progress.percent || 0;
        onProgress({
          progress: Math.min(Math.max(percent, 0), 100),
          currentFps: progress.currentFps,
          currentKbps: progress.currentKbps,
          targetSize: progress.targetSize,
          timemark: progress.timemark,
        });
      });
    }

    // Handle completion
    command.on('end', () => {
      resolve();
    });

    // Handle errors
    command.on('error', (err) => {
      reject(err);
    });

    // Save to output path
    command.save(outputPath);
  });
}

// Get estimated bitrate based on quality preset
export function getEstimatedBitrate(
  quality: 'high' | 'medium' | 'low',
  resolution: string
): number {
  const baseRates: Record<string, number> = {
    '1080p': 8000,
    '720p': 5000,
    '480p': 2500,
    '360p': 1000,
    original: 5000,
  };

  const qualityMultipliers = {
    high: 1.0,
    medium: 0.7,
    low: 0.5,
  };

  return Math.floor(baseRates[resolution] * qualityMultipliers[quality]);
}

// Calculate compression ratio
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return parseFloat(((1 - compressedSize / originalSize) * 100).toFixed(2));
}
