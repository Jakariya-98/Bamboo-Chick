import path from 'path';
import fs from 'fs';
import { promises as fsp } from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { ApiError } from '../utils/http.js';

// Anchor uploads to this server package so upload and static serving agree
// regardless of which directory was active when the server was started.
export const uploadDir = fileURLToPath(new URL('../../uploads/', import.meta.url));
fs.mkdirSync(uploadDir, { recursive: true });

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']);
const MAX_BYTES = 100 * 1024 * 1024;

// Small dependency-free multipart handler for one file field named "file".
// Files are stored locally in server/uploads; regular text fields go into req.body.
export async function uploadMedia(req, _res, next) {
  try {
    const contentType = req.headers['content-type'] || '';
    const match = contentType.match(/multipart\/form-data;\s*boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!match) throw new ApiError(400, 'Upload must use multipart form data.');
    if (Number(req.headers['content-length'] || 0) > MAX_BYTES + 1024 * 1024) throw new ApiError(413, 'File is too large. Maximum size is 100 MB.');

    const chunks = [];
    let total = 0;
    for await (const chunk of req) {
      total += chunk.length;
      if (total > MAX_BYTES + 1024 * 1024) throw new ApiError(413, 'File is too large. Maximum size is 100 MB.');
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const boundary = Buffer.from(`--${match[1] || match[2]}`);
    req.body = {};
    let cursor = 0;

    while (true) {
      const start = buffer.indexOf(boundary, cursor);
      if (start < 0) break;
      let partStart = start + boundary.length;
      if (buffer.subarray(partStart, partStart + 2).toString() === '--') break;
      if (buffer.subarray(partStart, partStart + 2).toString() === '\r\n') partStart += 2;
      const nextBoundary = buffer.indexOf(boundary, partStart);
      if (nextBoundary < 0) break;
      let part = buffer.subarray(partStart, nextBoundary);
      if (part.subarray(part.length - 2).toString() === '\r\n') part = part.subarray(0, part.length - 2);
      const splitAt = part.indexOf(Buffer.from('\r\n\r\n'));
      if (splitAt < 0) { cursor = nextBoundary; continue; }

      const headerText = part.subarray(0, splitAt).toString('utf8');
      const data = part.subarray(splitAt + 4);
      const disposition = headerText.match(/content-disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]*)")?/i);
      if (!disposition) { cursor = nextBoundary; continue; }

      // NOTE: the regex above must not be greedy — the old `[^\r\n]*name=` matched `filename=` and treated the file as a text field.
      const fieldName = disposition[1];
      const filename = disposition[2];
      if (filename !== undefined) {
        if (fieldName !== 'file' || !filename) throw new ApiError(400, 'Choose a file to upload.');
        if (data.length > MAX_BYTES) throw new ApiError(413, 'File is too large. Maximum size is 100 MB.');
        const mimeMatch = headerText.match(/content-type:\s*([^\r\n]+)/i);
        const mimetype = (mimeMatch?.[1] || 'application/octet-stream').trim().toLowerCase();
        if (!allowed.has(mimetype)) throw new ApiError(400, 'Choose an image (JPG, PNG, WEBP, GIF) or video (MP4, WEBM, MOV).');
        const ext = path.extname(filename).toLowerCase().slice(0, 10);
        const storedName = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${ext}`;
        await fsp.writeFile(path.join(uploadDir, storedName), data);
        req.file = { filename: storedName, originalname: filename, mimetype, size: data.length };
      } else {
        req.body[fieldName] = data.toString('utf8');
      }
      cursor = nextBoundary;
    }
    next();
  } catch (err) { next(err); }
}
