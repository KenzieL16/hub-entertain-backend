import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';

const extractToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
};

/** Wajib login. Mengisi req.user. */
export const protect = async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw new ApiError(401, 'Authentication required');

  const payload = verifyToken(token); // JsonWebTokenError / TokenExpiredError ditangani errorHandler
  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'User no longer exists');

  req.user = user;
  next();
};

/** Boleh anonim; kalau token valid, req.user terisi. Token rusak dianggap anonim. */
export const optionalAuth = async (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = await User.findById(payload.sub);
    } catch {
      /* abaikan */
    }
  }
  next();
};

export const restrictTo = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) throw new ApiError(403, 'You do not have permission to do that');
  next();
};
