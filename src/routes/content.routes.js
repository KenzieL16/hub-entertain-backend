import { Router } from 'express';
import { getCategory, getContent, getHome, listCategories, searchContents } from '../controllers/content.controller.js';
import { createReview, deleteReview, listReviews, updateReview } from '../controllers/review.controller.js';
import { optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  categoryQuerySchema,
  homeQuerySchema,
  reviewListQuerySchema,
  reviewSchema,
  reviewUpdateSchema,
  searchQuerySchema,
} from '../validators/content.js';

const router = Router();

// Home & kategori
router.get('/home', validate(homeQuerySchema, 'query'), getHome);
router.get('/categories', listCategories);
router.get('/categories/:slug', validate(categoryQuerySchema, 'query'), getCategory);

// Konten (search harus sebelum :slug)
router.get('/contents/search', validate(searchQuerySchema, 'query'), searchContents);
router.get('/contents/:slug', getContent);

// Komentar / review di halaman detail
router.get('/contents/:slug/reviews', optionalAuth, validate(reviewListQuerySchema, 'query'), listReviews);
router.post('/contents/:slug/reviews', protect, validate(reviewSchema), createReview);
router.patch('/reviews/:id', protect, validate(reviewUpdateSchema), updateReview);
router.delete('/reviews/:id', protect, deleteReview);

export default router;
