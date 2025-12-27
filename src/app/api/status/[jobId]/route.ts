import { NextRequest, NextResponse } from 'next/server';
import { StatusResponse, CompressionResult } from '@/types';
import { getJob, getUpload } from '@/lib/jobManager';
import { getVideoMetadata } from '@/lib/ffmpeg';
import { calculateCompressionRatio } from '@/lib/compression';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const response: StatusResponse = {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      error: job.error,
    };

    // If completed, include result
    if (job.status === 'completed' && job.outputFile) {
      const upload = getUpload(job.uploadId);
      if (upload) {
        const compressedMetadata = await getVideoMetadata(job.outputFile.path);

        const result: CompressionResult = {
          jobId: job.id,
          original: upload.metadata,
          compressed: compressedMetadata,
          compressionRatio: calculateCompressionRatio(
            upload.file.size,
            job.outputFile.size
          ),
          spaceSaved: upload.file.size - job.outputFile.size,
          downloadUrl: `/api/download/${jobId}`,
        };

        response.result = result;
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: 'Failed to get status. Please try again.' },
      { status: 500 }
    );
  }
}
