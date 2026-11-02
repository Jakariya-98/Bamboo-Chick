import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/http.js';

function monthRange(month) {
  // month = 'YYYY-MM'; defaults to current month
  const now = new Date();
  const [y, m] = (month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`).split('-').map(Number);
  if (!y || !m || m < 1 || m > 12) throw new ApiError(400, 'month must look like 2026-10');
  return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1), label: `${y}-${String(m).padStart(2, '0')}` };
}

// GET /api/reports/monthly?month=2026-10  (seller, admin) — "Monthly product sales report" story
export const monthlySales = asyncHandler(async (req, res) => {
  const { start, end, label } = monthRange(req.query.month);
  const match = { createdAt: { $gte: start, $lt: end }, status: { $ne: 'Cancelled' } };

  const [byProduct, summary] = await Promise.all([
    Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.unitPrice', '$items.qty'] } }
        }
      },
      { $sort: { revenue: -1 } }
    ]),
    Order.aggregate([
      { $match: match },
      { $group: { _id: null, orders: { $sum: 1 }, grossTotal: { $sum: '$pricing.total' }, vat: { $sum: '$pricing.vat' } } }
    ])
  ]);

  const productRevenue = byProduct.reduce((a, p) => a + p.revenue, 0);
  res.json({
    month: label,
    orders: summary[0]?.orders || 0,
    grossTotal: summary[0]?.grossTotal || 0,    // incl. VAT, delivery, installation
    vatCollected: summary[0]?.vat || 0,
    productRevenue,                              // goods only, before discount/VAT
    products: byProduct.map((p) => ({
      productId: p._id,
      name: p.name,
      unitsSold: p.unitsSold,
      revenue: p.revenue,
      share: productRevenue ? Math.round((p.revenue / productRevenue) * 1000) / 10 : 0
    }))
  });
});

// GET /api/reports/overview  (seller, admin) — dashboard cards
export const overview = asyncHandler(async (_req, res) => {
  const { start, end } = monthRange();
  const [statusCounts, monthAgg, lowStock, ratingAgg, productCount, userCounts, reviewCount] = await Promise.all([
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end }, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$pricing.total' } } }
    ]),
    Product.find({ isActive: true, stock: { $lt: 10 } }).select('name stock').sort({ stock: 1 }),
    Review.aggregate([{ $match: { hidden: false } }, { $group: { _id: null, avg: { $avg: '$stars' } } }]),
    Product.countDocuments({ isActive: true }),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Review.countDocuments()
  ]);

  const totalRevenue = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $group: { _id: null, revenue: { $sum: '$pricing.total' } } }
  ]);

  res.json({
    statusCounts: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
    monthOrders: monthAgg[0]?.orders || 0,
    monthRevenue: monthAgg[0]?.revenue || 0,
    totalRevenue: totalRevenue[0]?.revenue || 0,
    lowStock,
    avgRating: ratingAgg[0] ? Math.round(ratingAgg[0].avg * 10) / 10 : 0,
    productCount,
    reviewCount,
    users: Object.fromEntries(userCounts.map((u) => [u._id, u.count]))
  });
});

// GET /api/reports/users  (admin)
export const listUsers = asyncHandler(async (_req, res) => {
  res.json(await User.find().sort({ role: 1, createdAt: -1 }));
});
