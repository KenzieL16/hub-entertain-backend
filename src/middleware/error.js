import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) =>
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message;
  let errors = err.errors;

  if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    message = errors[0].message;
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    const key = Object.keys(err.keyPattern || {});
    message = key.includes('email')
      ? 'Email is already registered'
      : key.includes('user')
        ? 'You have already reviewed this title'
        : 'Duplicate value';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Session expired, please log in again';
  } else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON body';
  }

  if (status >= 500) {
    console.error(err);
    if (env.isProd) message = 'Internal server error';
  }

  res.status(status).json({
    message,
    ...(errors && { errors }),
    ...(!env.isProd && status >= 500 && { stack: err.stack }),
  });
};
