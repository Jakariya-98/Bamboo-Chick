import Blog from '../models/Blog.js';
import { ApiError, asyncHandler } from '../utils/http.js';

// GET /api/blogs  (public)
export const listBlogs = asyncHandler(async (_req, res) => {
  res.json(await Blog.find().sort({ createdAt: -1 }).populate('author', 'name'));
});

// POST /api/blogs  (seller, admin) { title, body, tone, product } — "Add blogs" story
export const createBlog = asyncHandler(async (req, res) => {
  const { title, body, tone, product } = req.body;
  if (!title || !body) throw new ApiError(400, 'Title and content are required');
  const blog = await Blog.create({ title, body, tone, product: product || undefined, author: req.user._id });
  res.status(201).json(blog);
});

// DELETE /api/blogs/:id  (seller, admin)
export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) throw new ApiError(404, 'Blog not found');
  res.json({ message: 'Blog deleted' });
});
