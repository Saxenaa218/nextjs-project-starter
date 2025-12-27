import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const COMPRESSED_DIR = process.env.COMPRESSED_DIR || './compressed';

// Ensure directories exist
export function ensureDirectories() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(COMPRESSED_DIR)) {
    fs.mkdirSync(COMPRESSED_DIR, { recursive: true });
  }
}

// Generate unique filename
export function generateUniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const basename = path.basename(originalName, ext);
  const uniqueId = uuidv4();
  return `${basename}-${uniqueId}${ext}`;
}

// Get upload path
export function getUploadPath(filename: string): string {
  ensureDirectories();
  return path.join(UPLOAD_DIR, filename);
}

// Get compressed path
export function getCompressedPath(filename: string): string {
  ensureDirectories();
  return path.join(COMPRESSED_DIR, filename);
}

// Clean up old files
export function cleanupFile(filepath: string): void {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error(`Failed to cleanup file ${filepath}:`, error);
  }
}

// Clean up files older than specified time (in hours)
export function cleanupOldFiles(directory: string, maxAgeHours: number = 24): void {
  try {
    const files = fs.readdirSync(directory);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;

    files.forEach((file) => {
      const filepath = path.join(directory, file);
      const stats = fs.statSync(filepath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        cleanupFile(filepath);
      }
    });
  } catch (error) {
    console.error(`Failed to cleanup old files in ${directory}:`, error);
  }
}

// Get file size
export function getFileSize(filepath: string): number {
  try {
    const stats = fs.statSync(filepath);
    return stats.size;
  } catch (error) {
    console.error(`Failed to get file size for ${filepath}:`, error);
    return 0;
  }
}

// Check if file exists
export function fileExists(filepath: string): boolean {
  return fs.existsSync(filepath);
}

// Read file
export function readFile(filepath: string): Buffer {
  return fs.readFileSync(filepath);
}

// Get file extension
export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

// Validate video file extension
export function isValidVideoFile(filename: string): boolean {
  const validExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  const ext = getFileExtension(filename);
  return validExtensions.includes(ext);
}
