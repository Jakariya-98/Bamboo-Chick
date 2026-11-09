import { ApiError, asyncHandler } from '../utils/http.js';

// Used for optional blog cover images. The file itself is stored by the upload middleware.
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Choose an image or video first.');
  res.status(201).json({ url: `/uploads/${req.file.filename}`, type: req.file.mimetype.startsWith('video/') ? 'video' : 'image' });
});
