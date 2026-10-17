import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError, asyncHandler } from '../utils/http.js';

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

async function userFromHeader(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    return await User.findById(payload.id);
  } catch {
    return null;
  }
}

/** Requires a valid login. Sets req.user. */
export const protect = asyncHandler(async (req, _res, next) => {
  const user = await userFromHeader(req);
  if (!user) throw new ApiError(401, 'Please log in');
  req.user = user;
  next();
});

/** Sets req.user if a valid token is sent, but does not require it. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  req.user = await userFromHeader(req);
  next();
});

/** Use after protect: authorize('seller', 'admin') */
export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission for this action'));
  }
  next();
};
