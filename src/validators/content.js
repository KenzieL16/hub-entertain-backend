import { z } from 'zod';

const page = z.coerce.number().int().min(1).default(1);

export const categoryQuerySchema = z.object({
  genre: z.string().trim().min(1).optional(),
  sort: z.enum(['rating', 'newest', 'title']).default('rating'),
  page,
  limit: z.coerce.number().int().min(1).max(100).default(40),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query is required').max(50),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const homeQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(30).default(10),
});

export const reviewListQuerySchema = z.object({
  page,
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const reviewSchema = z.object({
  rating: z.number().int('Rating must be a whole number').min(1, 'Rating must be 1–5').max(5, 'Rating must be 1–5'),
  title: z.string().trim().max(100, 'Title is too long').optional(),
  comment: z.string().trim().min(1, 'Review cannot be empty').max(1000, 'Review is limited to 1000 characters'),
});

export const reviewUpdateSchema = reviewSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Nothing to update' });
