# Video Compressor

A full-stack video compression application built with Next.js, React, and FFmpeg. Compress your videos with advanced options while maintaining quality.

## Features

### Frontend
- **Drag & Drop Upload**: Easy video file upload with drag-and-drop support
- **Advanced Compression Options**:
  - Resolution selection (Original, 1080p, 720p, 480p, 360p)
  - Quality presets (High, Medium, Low)
  - Custom bitrate control (500kbps - 10Mbps)
  - Frame rate adjustment (Original, 60fps, 30fps, 24fps)
  - Audio options (Keep, Reduce quality, Remove)
- **Real-time Progress**: Live compression progress with estimated time remaining
- **Results Display**: Side-by-side comparison with compression statistics
- **Video Preview**: Preview both original and compressed videos
- **Modern UI**: Clean, responsive design with dark mode support

### Backend
- **Efficient Processing**: FFmpeg-based video compression
- **Multiple API Endpoints**:
  - `/api/upload` - Handle video uploads
  - `/api/compress` - Start compression jobs
  - `/api/status/[jobId]` - Check compression status
  - `/api/download/[jobId]` - Download compressed videos
- **Job Management**: Track and manage compression jobs
- **Automatic Cleanup**: Remove old files automatically

## Tech Stack

- **Framework**: Next.js 15.3.2
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4.1.6
- **UI Components**: Radix UI primitives
- **Video Processing**: FFmpeg via fluent-ffmpeg
- **File Uploads**: Formidable
- **Notifications**: Sonner (toast notifications)
- **Drag & Drop**: react-dropzone
- **TypeScript**: Full type safety

## Prerequisites

- Node.js 20+ installed
- FFmpeg installed on your system (or use Docker)

### Installing FFmpeg

**macOS (using Homebrew)**:
```bash
brew install ffmpeg
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows**:
Download from [FFmpeg official website](https://ffmpeg.org/download.html)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Saxenaa218/nextjs-project-starter.git
cd nextjs-project-starter
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
MAX_FILE_SIZE=524288000
UPLOAD_DIR=./uploads
COMPRESSED_DIR=./compressed
FFMPEG_PATH=
JOB_TIMEOUT=1800000
```

## Running Locally

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:8000`

### Production Mode
```bash
npm run build
npm start
```

## Running with Docker

### Using Docker Compose (Recommended)
```bash
docker-compose up -d
```

### Using Docker
```bash
# Build the image
docker build -t video-compressor .

# Run the container
docker run -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/compressed:/app/compressed \
  video-compressor
```

The application will be available at `http://localhost:3000`

## API Documentation

### POST /api/upload
Upload a video file for compression.

**Request**: Multipart form data with `video` field
**Response**:
```json
{
  "uploadId": "string",
  "file": {
    "id": "string",
    "name": "string",
    "size": number,
    "duration": number
  },
  "metadata": {
    "duration": number,
    "width": number,
    "height": number,
    "fps": number,
    "bitrate": number
  }
}
```

### POST /api/compress
Start a compression job.

**Request**:
```json
{
  "uploadId": "string",
  "options": {
    "resolution": "original" | "1080p" | "720p" | "480p" | "360p",
    "quality": "high" | "medium" | "low",
    "bitrate": number,
    "frameRate": "original" | "60" | "30" | "24",
    "audio": "keep" | "remove" | "reduce"
  }
}
```

**Response**:
```json
{
  "jobId": "string",
  "status": "pending"
}
```

### GET /api/status/[jobId]
Check the status of a compression job.

**Response**:
```json
{
  "jobId": "string",
  "status": "pending" | "processing" | "completed" | "failed",
  "progress": number,
  "error": "string",
  "result": {
    "original": { ... },
    "compressed": { ... },
    "compressionRatio": number,
    "spaceSaved": number,
    "downloadUrl": "string"
  }
}
```

### GET /api/download/[jobId]
Download the compressed video.

**Response**: Video file stream

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/route.ts
│   │   │   ├── compress/route.ts
│   │   │   ├── status/[jobId]/route.ts
│   │   │   └── download/[jobId]/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── VideoUploader.tsx
│   │   ├── CompressionOptions.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── VideoPreview.tsx
│   │   ├── ResultsDisplay.tsx
│   │   └── ui/
│   ├── lib/
│   │   ├── ffmpeg.ts
│   │   ├── storage.ts
│   │   ├── compression.ts
│   │   ├── jobManager.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── public/
├── uploads/
├── compressed/
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Configuration

### Environment Variables

- `MAX_FILE_SIZE`: Maximum upload file size in bytes (default: 500MB)
- `UPLOAD_DIR`: Directory for temporary uploads (default: ./uploads)
- `COMPRESSED_DIR`: Directory for compressed videos (default: ./compressed)
- `FFMPEG_PATH`: Custom FFmpeg binary path (optional)
- `JOB_TIMEOUT`: Maximum time for a compression job in milliseconds (default: 30 minutes)

### Compression Presets

- **High Quality**: CRF 20, maintains original resolution
- **Medium Quality**: CRF 25, balanced compression
- **Low Quality**: CRF 30, aggressive compression

## Security Considerations

- File type validation (server-side)
- File size limits enforced
- Sanitized filenames
- Automatic cleanup of old files
- Non-root user in Docker

## Troubleshooting

### FFmpeg not found
Ensure FFmpeg is installed and in your system PATH, or set `FFMPEG_PATH` in `.env`

### Upload fails
Check `MAX_FILE_SIZE` setting and ensure the `uploads` directory is writable

### Compression fails
Check FFmpeg logs and ensure sufficient disk space in `compressed` directory

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
