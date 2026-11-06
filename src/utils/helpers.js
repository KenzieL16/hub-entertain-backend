export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const pagination = (page, limit, total) => ({
  page,
  limit,
  total,
  pages: Math.max(1, Math.ceil(total / limit)),
});
