import Setting from '../models/Setting.js';
import { asyncHandler } from '../utils/http.js';
import { SIZES } from '../utils/pricing.js';
import { notify } from '../utils/notifications.js';

// GET /api/settings  (public) — the shop needs tax rates, delivery charges, offer and sizes
export const getSettings = asyncHandler(async (_req, res) => {
  const s = await Setting.getStore();
  res.json({ ...s.toObject(), sizes: SIZES });
});

// PUT /api/settings  (seller, admin) — "Add discounts" + tax settings
export const updateSettings = asyncHandler(async (req, res) => {
  const allowed = ['vatRate', 'installVatRate', 'installRate', 'delivery', 'deliveryDays', 'discount'];

  const s = await Setting.getStore();
  const previous = s.toObject().discount;

  for (const key of allowed) {
    if (req.body[key] === undefined) continue;
    if (typeof req.body[key] === 'object') s.set(key, { ...s.toObject()[key], ...req.body[key] });
    else s.set(key, req.body[key]);
  }

  await s.save();

  if (s.discount.active && s.discount.pct > 0 && (!previous.active || previous.pct !== s.discount.pct || previous.minQty !== s.discount.minQty)) {
    await notify({
      role: 'buyer',
      eventKey: `store-offer:${s.updatedAt.getTime()}`,
      title: 'New offer',
      message: `Get ${s.discount.pct}% off when buying ${s.discount.minQty} or more items.`,
      link: '/shop'
    });
  }

  res.json({ ...s.toObject(), sizes: SIZES });
});
