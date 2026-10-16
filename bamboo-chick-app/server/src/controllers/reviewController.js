import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { ApiError, asyncHandler } from '../utils/http.js';

// GET /api/reviews/product/:productId  (public) — visible reviews only
export const productReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, hidden: false }).sort({ createdAt: -1 });
  res.json(reviews);
});

// POST /api/reviews/product/:productId  (logged-in buyer) { stars, text } — "Give reviews" story
export const addReview = asyncHandler(async (req, res) => {
  const { stars, text } = req.body;
  if (!(await Product.exists({ _id: req.params.productId }))) throw new ApiError(404, 'Product not found');
  const review = await Review.create({
    product: req.params.productId,
    user: req.user._id,
    name: req.user.name,
    stars,
    text
  });
  res.status(201).json(review);
});

// GET /api/reviews  (seller, admin) — all reviews incl. hidden, "See customer reviews" story
export const allReviews = asyncHandler(async (_req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 }).populate('product', 'name');
  res.json(reviews);
});

// PATCH /api/reviews/:id/visibility  (admin) { hidden: true|false }
export const setVisibility = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { hidden: Boolean(req.body.hidden) }, { new: true });
  if (!review) throw new ApiError(404, 'Review not found');
  res.json(review);
});
