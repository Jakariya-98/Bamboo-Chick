
import Blog from '../models/Blog.js';
import { ApiError, asyncHandler } from '../utils/http.js';

// GET /api/blogs (public)
export const listBlogs = asyncHandler(async (_req, res) => {
  res.json(
    await Blog.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name')
      .populate('product', 'name')
  );
});

// POST /api/blogs (seller, admin)
export const createBlog = asyncHandler(async (req, res) => {
  const { title, body, tone, product, coverImage } = req.body;

  if (!title || !body) {
    throw new ApiError(400, 'Title and content are required');
  }

  const blog = await Blog.create({
    title,
    body,
    tone,
    coverImage: coverImage || '',
    product: product || undefined,
    author: req.user._id
  });

  res.status(201).json(blog);
});

// PUT /api/blogs/:id (seller, admin)
export const updateBlog = asyncHandler(async (req, res) => {
  const { title, body, tone, product, coverImage } = req.body;

  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  if (title !== undefined) blog.title = title;
  if (body !== undefined) blog.body = body;
  if (tone !== undefined) blog.tone = tone;
  if (coverImage !== undefined) blog.coverImage = coverImage;
  if (product !== undefined) blog.product = product || undefined;

  await blog.save();

  res.json(blog);
});

// DELETE /api/blogs/:id (seller, admin)
export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);

  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  res.json({ message: 'Blog deleted' });
});
