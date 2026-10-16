import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { ApiError, asyncHandler } from '../utils/http.js';

/** Adds { rating, reviewCount } to each product from visible reviews. */
async function withRatings(products) {
  const ids = products.map((p) => p._id);
  const stats = await Review.aggregate([
    { $match: { product: { $in: ids }, hidden: false } },
    { $group: { _id: '$product', rating: { $avg: '$stars' }, reviewCount: { $sum: 1 } } }
  ]);
  const byId = Object.fromEntries(stats.map((s) => [String(s._id), s]));
  return products.map((p) => {
    const s = byId[String(p._id)];
    return { ...p.toObject(), rating: s ? Math.round(s.rating * 10) / 10 : 0, reviewCount: s?.reviewCount || 0 };
  });
}

// GET /api/products?category=Roman&q=walnut
export const listProducts = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
  if (req.query.q) filter.$text = { $search: req.query.q };
  const products = await Product.find(filter).sort({ createdAt: 1 });
  res.json(await withRatings(products));
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, 'Product not found');
  const product = await Product.findById(req.params.id);
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
  const [withRating] = await withRatings([product]);
  res.json(withRating);
});

// POST /api/products  (seller, admin)
export const createProduct = asyncHandler(async (req, res) => {
  const { name, category, tone, basePrice, stock, description, images, tags } = req.body;
  const product = await Product.create({ name, category, tone, basePrice, stock, description, images, tags });
  res.status(201).json(product);
});

// PUT /api/products/:id  (seller, admin) — "Change price rate" and "Update stock" stories
export const updateProduct = asyncHandler(async (req, res) => {
  const allowed = ['name', 'category', 'tone', 'basePrice', 'stock', 'description', 'images', 'tags', 'isActive'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json(product);
});

// DELETE /api/products/:id  (seller, admin) — soft delete so old orders still make sense
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ message: 'Product removed from the store' });
});

// POST /api/products/recommendations  { room, need, budget } — "Customized recommendations" story
export const recommend = asyncHandler(async (req, res) => {
  const { room, need, budget } = req.body;
  if (!room || !need || !budget) throw new ApiError(400, 'room, need and budget are required');

  const products = await Product.find({ isActive: true, stock: { $gt: 0 } });
  const score = (p) => (p.tags.includes(room) ? 3 : 0) + (p.tags.includes(need) ? 2 : 0) + (p.tags.includes(budget) ? 1 : 0);
  const picks = products
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s >= 3)
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => x.p);

  res.json(await withRatings(picks));
});
