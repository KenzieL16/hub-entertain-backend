import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (userId, rememberMe = false) =>
  jwt.sign({ sub: String(userId) }, env.jwtSecret, {
    expiresIn: rememberMe ? env.jwtRememberExpiresIn : env.jwtExpiresIn,
  });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);
