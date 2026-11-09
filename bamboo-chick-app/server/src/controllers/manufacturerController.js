import Manufacturer from '../models/Manufacturer.js';
import { ApiError, asyncHandler } from '../utils/http.js';

// GET /api/manufacturer  (public)
export const getManufacturer = asyncHandler(async (_req, res) => {
  res.json(await Manufacturer.getPage());
});

// PUT /api/manufacturer  (admin) { title, description }
export const updateManufacturer = asyncHandler(async (req, res) => {
  const page = await Manufacturer.getPage();
  if (typeof req.body.title === 'string') page.title = req.body.title.trim() || 'About Bamboo Chick';
  if (typeof req.body.description === 'string') page.description = req.body.description.trim();
  await page.save();
  res.json(page);
});

// POST /api/manufacturer/media  (admin) multipart: file + title
export const addManufacturerMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Choose a picture or video first.');
  const page = await Manufacturer.getPage();
  const type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
  page.media.unshift({ title: String(req.body.title || '').trim(), url: `/uploads/${req.file.filename}`, type, uploadedBy: req.user._id });
  await page.save();
  res.status(201).json(page);
});

// DELETE /api/manufacturer/media/:mediaId  (admin)
export const deleteManufacturerMedia = asyncHandler(async (req, res) => {
  const page = await Manufacturer.getPage();
  const item = page.media.id(req.params.mediaId);
  if (!item) throw new ApiError(404, 'Media item not found.');
  item.deleteOne();
  await page.save();
  res.json(page);
});
