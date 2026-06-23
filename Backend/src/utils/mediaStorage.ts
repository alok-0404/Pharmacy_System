import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads');

export async function ensureUploadDir(subdir: string): Promise<string> {
  const dir = path.join(UPLOADS_ROOT, subdir);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function saveBufferToUploads(
  subdir: string,
  buffer: Buffer,
  extension: string,
): Promise<string> {
  const dir = await ensureUploadDir(subdir);
  const filename = `${Date.now()}-${randomBytes(6).toString('hex')}${extension}`;
  const fullPath = path.join(dir, filename);
  await fs.writeFile(fullPath, buffer);
  return `/uploads/${subdir}/${filename}`;
}
