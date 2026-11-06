import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { login, me, register } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isProd ? 20 : 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
});

const router = Router();

router.post('/register', limiter, validate(registerSchema), register);
router.post('/login', limiter, validate(loginSchema), login);
router.get('/me', protect, me);

export default router;
