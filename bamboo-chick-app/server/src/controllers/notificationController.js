import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { monthlyReportNotice } from '../utils/notifications.js';
import { ApiError, asyncHandler } from '../utils/http.js';

export const list = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') await monthlyReportNotice(req.user._id);

  const filter = { recipient: req.user._id };

  const [items, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1, _id: -1 }).limit(100).lean(),
    Notification.countDocuments({ ...filter, readAt: null })
  ]);

  res.json({ items, unread });
});

export const read = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, 'Notification not found');

  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { readAt: new Date() },
    { new: true }
  );

  if (!item) throw new ApiError(404, 'Notification not found');

  res.json(item);
});

export const readAll = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, readAt: null },
    { readAt: new Date() }
  );

  res.json({ ok: true });
});