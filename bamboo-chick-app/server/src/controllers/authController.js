import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { ApiError, asyncHandler } from '../utils/http.js';

// POST /api/auth/register  — public sign-up always creates a BUYER account
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) throw new ApiError(400, 'Name, email and password are required');
  if (password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');
  if (await User.exists({ email: email.toLowerCase() })) throw new ApiError(409, 'Email is already registered');

  const user = await User.create({ name, email, password, phone, address, role: 'buyer' });
  res.status(201).json({ token: signToken(user), user });
});

// POST /api/auth/login  — buyers, sellers and admin all log in here
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Wrong email or password');

  res.json({ token: signToken(user), user });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
