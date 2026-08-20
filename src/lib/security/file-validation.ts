/**
 * Strict File Upload Security & Validation
 */

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
];

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

export function validateUploadedFile(file: { name: string; type: string; size: number }): FileValidationResult {
  // 1. Size Limit Check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds maximum allowed limit of 100MB.' };
  }

  // 2. MIME Whitelist Check
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return { valid: false, error: `Invalid file type (${file.type}). Allowed types: PDF, JPEG, PNG, WEBP, MP4, MOV.` };
  }

  // 3. Filename Sanitization & Path Traversal Protection
  const sanitizedFilename = file.name
    .replace(/^.*[\\\/]/, '') // Strip path directories
    .replace(/[^a-zA-Z0-9_.-]/g, '_'); // Sanitize dangerous characters

  if (sanitizedFilename.includes('..')) {
    return { valid: false, error: 'Path traversal attempt detected in filename.' };
  }

  return { valid: true, sanitizedFilename };
}
