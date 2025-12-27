import { CompressionJob, CompressionOptions, VideoFile } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory job storage (in production, use a database)
const jobs = new Map<string, CompressionJob>();
const uploads = new Map<string, { file: VideoFile; metadata: any }>();

// Store upload
export function storeUpload(file: VideoFile, metadata: any): string {
  const uploadId = uuidv4();
  uploads.set(uploadId, { file, metadata });
  return uploadId;
}

// Get upload
export function getUpload(uploadId: string) {
  return uploads.get(uploadId);
}

// Create job
export function createJob(
  uploadId: string,
  options: CompressionOptions,
  inputFile: VideoFile
): string {
  const jobId = uuidv4();
  const job: CompressionJob = {
    id: jobId,
    uploadId,
    status: 'pending',
    progress: 0,
    options,
    inputFile,
    startedAt: new Date(),
  };
  jobs.set(jobId, job);
  return jobId;
}

// Get job
export function getJob(jobId: string): CompressionJob | undefined {
  return jobs.get(jobId);
}

// Update job
export function updateJob(jobId: string, updates: Partial<CompressionJob>): void {
  const job = jobs.get(jobId);
  if (job) {
    jobs.set(jobId, { ...job, ...updates });
  }
}

// Update job progress
export function updateJobProgress(jobId: string, progress: number): void {
  const job = jobs.get(jobId);
  if (job) {
    jobs.set(jobId, { ...job, progress });
  }
}

// Mark job as completed
export function completeJob(jobId: string, outputFile: VideoFile): void {
  const job = jobs.get(jobId);
  if (job) {
    jobs.set(jobId, {
      ...job,
      status: 'completed',
      progress: 100,
      outputFile,
      completedAt: new Date(),
    });
  }
}

// Mark job as failed
export function failJob(jobId: string, error: string): void {
  const job = jobs.get(jobId);
  if (job) {
    jobs.set(jobId, {
      ...job,
      status: 'failed',
      error,
      completedAt: new Date(),
    });
  }
}

// Clean up old jobs
export function cleanupOldJobs(maxAgeHours: number = 24): void {
  const now = Date.now();
  const maxAge = maxAgeHours * 60 * 60 * 1000;

  for (const [jobId, job] of jobs.entries()) {
    if (job.completedAt) {
      const age = now - job.completedAt.getTime();
      if (age > maxAge) {
        jobs.delete(jobId);
      }
    }
  }

  // Clean up old uploads
  for (const [uploadId] of uploads.entries()) {
    // Check if upload is associated with any active job
    const hasActiveJob = Array.from(jobs.values()).some(
      (job) => job.uploadId === uploadId && job.status !== 'failed'
    );
    if (!hasActiveJob) {
      uploads.delete(uploadId);
    }
  }
}
