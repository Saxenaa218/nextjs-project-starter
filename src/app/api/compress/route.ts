import { NextRequest, NextResponse } from 'next/server';
import { CompressRequest, CompressResponse, VideoFile } from '@/types';
import { getUpload, createJob, updateJob } from '@/lib/jobManager';
import { compressVideo } from '@/lib/compression';
import { generateUniqueFilename, getCompressedPath, getFileSize } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body: CompressRequest = await request.json();
    const { uploadId, options } = body;

    if (!uploadId || !options) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get upload
    const upload = getUpload(uploadId);
    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    // Validate compression options
    if (!['high', 'medium', 'low'].includes(options.quality)) {
      return NextResponse.json({ error: 'Invalid quality preset' }, { status: 400 });
    }

    if (!['original', '1080p', '720p', '480p', '360p'].includes(options.resolution)) {
      return NextResponse.json({ error: 'Invalid resolution' }, { status: 400 });
    }

    if (!['original', '60', '30', '24'].includes(options.frameRate)) {
      return NextResponse.json({ error: 'Invalid frame rate' }, { status: 400 });
    }

    if (!['keep', 'remove', 'reduce'].includes(options.audio)) {
      return NextResponse.json({ error: 'Invalid audio option' }, { status: 400 });
    }

    // Create job
    const jobId = createJob(uploadId, options, upload.file);

    // Start compression in background
    const outputFilename = generateUniqueFilename(`compressed-${upload.file.name}`);
    const outputPath = getCompressedPath(outputFilename);

    // Run compression asynchronously
    compressVideo(upload.file.path, outputPath, options, (progress) => {
      updateJob(jobId, {
        status: 'processing',
        progress: progress.progress,
        estimatedTimeRemaining: progress.timemark
          ? calculateTimeRemaining(progress.timemark, upload.metadata.duration)
          : undefined,
      });
    })
      .then(() => {
        const outputFile: VideoFile = {
          id: outputFilename,
          name: outputFilename,
          size: getFileSize(outputPath),
          path: outputPath,
          mimeType: 'video/mp4',
        };

        updateJob(jobId, {
          status: 'completed',
          progress: 100,
          outputFile,
          completedAt: new Date(),
        });
      })
      .catch((error) => {
        console.error('Compression error:', error);
        updateJob(jobId, {
          status: 'failed',
          error: error.message || 'Compression failed',
          completedAt: new Date(),
        });
      });

    const response: CompressResponse = {
      jobId,
      status: 'pending',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Compress API error:', error);
    return NextResponse.json(
      { error: 'Failed to start compression. Please try again.' },
      { status: 500 }
    );
  }
}

function calculateTimeRemaining(timemark: string, totalDuration: number): number {
  // Parse timemark (format: HH:MM:SS.MS)
  const parts = timemark.split(':');
  if (parts.length !== 3) return 0;

  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parseFloat(parts[2]);

  const currentTime = hours * 3600 + minutes * 60 + seconds;
  const remainingTime = totalDuration - currentTime;

  return Math.max(0, Math.ceil(remainingTime));
}
