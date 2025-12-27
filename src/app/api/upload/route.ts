import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getVideoMetadata } from '@/lib/ffmpeg';
import {
  ensureDirectories,
  generateUniqueFilename,
  getUploadPath,
  isValidVideoFile,
} from '@/lib/storage';
import { storeUpload } from '@/lib/jobManager';
import { UploadResponse, VideoFile } from '@/types';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '524288000'); // 500MB

export async function POST(request: NextRequest) {
  try {
    ensureDirectories();

    // Convert Web Request to Node.js readable stream
    const formData = await request.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!isValidVideoFile(file.name)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only MP4, MOV, AVI, MKV, and WEBM files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds maximum allowed size of ${Math.floor(
            MAX_FILE_SIZE / (1024 * 1024)
          )}MB`,
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);
    const filepath = getUploadPath(uniqueFilename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filepath, buffer);

    // Get video metadata
    const metadata = await getVideoMetadata(filepath);

    // Create video file object
    const videoFile: VideoFile = {
      id: uniqueFilename,
      name: file.name,
      size: file.size,
      duration: metadata.duration,
      path: filepath,
      mimeType: file.type,
    };

    // Store upload
    const uploadId = storeUpload(videoFile, metadata);

    const response: UploadResponse = {
      uploadId,
      file: videoFile,
      metadata,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    );
  }
}
