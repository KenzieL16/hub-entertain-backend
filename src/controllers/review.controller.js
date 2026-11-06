import mongoose from 'mongoose';
import { Content } from '../models/Content.js';
import { Review } from '../models/Review.js';
import { ApiError } from '../utils/ApiError.js';
import { pagination } from '../utils/helpers.js';

const serialize = (review, currentUser) => {
  const user = review.user; // sudah di-populate: { _id, fullName }
  const initials = user.fullName.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return {
    id: review.id,
    rating: review.rating,
    title: review.title || '',
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    user: { id: String(user._id), name: user.fullName, avatar: initials },
    isMine: Boolean(currentUser && String(currentUser._id) === String(user._id)),
  };
};

const findContentId = async (slug) => {
  const content = await Content.findOne({ slug }).select('_id');
  if (!content) throw new ApiError(404, 'Content not found');
  return content._id;
};

const getSummary = async (contentId) => {
  const [row] = await Review.aggregate([
    { $match: { content: contentId } },
    { $group: { _id: null, count: { $sum: 1 }, average: { $avg: '$rating' } } },
  ]);
  return { count: row?.count ?? 0, average: row ? Math.round(row.average * 10) / 10 : 0 };
};

const loadOwnReview = async (req) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, 'Review not found');
  const review = await Review.findById(req.params.id).populate('user', 'fullName');
  if (!review) throw new ApiError(404, 'Review not found');

  const isOwner = String(review.user._id) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'You can only change your own review');
  return review;
};

/** GET /api/contents/:slug/reviews?page=&limit= */
export const listReviews = async (req, res) => {
  const contentId = await findContentId(req.params.slug);
  const { page, limit } = req.valid.query;

  const [reviews, summary] = await Promise.all([
    Review.find({ content: contentId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'fullName'),
    getSummary(contentId),
  ]);

  res.json({
    summary,
    reviews: reviews.map((r) => serialize(r, req.user)),
    pagination: pagination(page, limit, summary.count),
  });
};

/** POST /api/contents/:slug/reviews */
export const createReview = async (req, res) => {
  const contentId = await findContentId(req.params.slug);

  if (await Review.exists({ content: contentId, user: req.user._id })) {
    throw new ApiError(409, 'You have already reviewed this title. Edit your existing review instead.');
  }

  const review = await Review.create({ ...req.valid.body, content: contentId, user: req.user._id });
  await review.populate('user', 'fullName');

  res.status(201).json({ review: serialize(review, req.user), summary: await getSummary(contentId) });
};

/** PATCH /api/reviews/:id */
export const updateReview = async (req, res) => {
  const review = await loadOwnReview(req);
  Object.assign(review, req.valid.body);
  await review.save();

  res.json({ review: serialize(review, req.user), summary: await getSummary(review.content) });
};

/** DELETE /api/reviews/:id */
export const deleteReview = async (req, res) => {
  const review = await loadOwnReview(req);
  await review.deleteOne();

  res.json({ message: 'Review deleted', summary: await getSummary(review.content) });
};
