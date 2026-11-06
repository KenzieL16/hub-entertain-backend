import { ApiError } from '../utils/ApiError.js';

/** validate(schema, 'body' | 'query'). Hasil parse ada di req.valid[source]. */
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    throw new ApiError(400, errors[0]?.message || 'Validation failed', errors);
  }
  req.valid = { ...(req.valid || {}), [source]: result.data };
  next();
};
