import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/lib/jobManager';
import { readFile, fileExists } from '@/lib/storage';
import fs from 'fs';

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

    if (job.status !== 'completed' || !job.outputFile) {
      return NextResponse.json(
        { error: 'Compression not completed or output file not available' },
        { status: 400 }
      );
    }

    if (!fileExists(job.outputFile.path)) {
      return NextResponse.json({ error: 'Output file not found' }, { status: 404 });
    }

    // Read file
    const fileBuffer = readFile(job.outputFile.path);

    // Create response with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${job.outputFile.name}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Failed to download file. Please try again.' },
      { status: 500 }
    );
  }
}
