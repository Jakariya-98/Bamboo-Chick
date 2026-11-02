import Setting from '../models/Setting.js';
import { asyncHandler } from '../utils/http.js';
import { SIZES } from '../utils/pricing.js';

// GET /api/settings  (public) — the shop needs tax rates, delivery charges, offer and sizes
export const getSettings = asyncHandler(async (_req, res) => {
  const s = await Setting.getStore();
  res.json({ ...s.toObject(), sizes: SIZES });
});

// PUT /api/settings  (seller, admin) — "Add discounts" + tax settings
export const updateSettings = asyncHandler(async (req, res) => {
  const allowed = ['vatRate', 'installVatRate', 'installRate', 'delivery', 'deliveryDays', 'discount'];
  const s = await Setting.getStore();
  for (const key of allowed) {
    if (req.body[key] === undefined) continue;
    if (typeof req.body[key] === 'object') s.set(key, { ...s.toObject()[key], ...req.body[key] });
    else s.set(key, req.body[key]);
  }
  await s.save();
  res.json({ ...s.toObject(), sizes: SIZES });
});
