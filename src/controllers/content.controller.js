import { Category } from '../models/Category.js';
import { Content } from '../models/Content.js';
import { ApiError } from '../utils/ApiError.js';
import { escapeRegex, pagination } from '../utils/helpers.js';

// Kartu di list tidak butuh teks panjang
const LIST_SELECT = '-synopsis -credits -tagline';

const SORTS = {
  rating: { rating: -1, title: 1 },
  newest: { year: -1, title: 1 },
  title: { title: 1 },
};

/** GET /api/home — hero + semua section untuk halaman Home */
export const getHome = async (req, res) => {
  const { limit } = req.valid.query;

  const [hero, categories] = await Promise.all([
    Content.findOne({ isHero: true }),
    Category.find().sort('order'),
  ]);

  const sections = await Promise.all(
    categories.map(async (cat) => ({
      ...cat.toJSON(),
      items: await Content.find({ category: cat.slug }).sort('order').limit(limit).select(LIST_SELECT),
    }))
  );

  res.json({ hero, sections });
};

/** GET /api/categories */
export const listCategories = async (_req, res) => {
  res.json({ categories: await Category.find().sort('order') });
};

/** GET /api/categories/:slug?genre=&sort=rating|newest|title&page=&limit= */
export const getCategory = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw new ApiError(404, 'Category not found');

  const { genre, sort, page, limit } = req.valid.query;
  const filter = { category: category.slug, ...(genre && { genres: genre }) };

  const [items, total, genres] = await Promise.all([
    Content.find(filter)
      .sort(SORTS[sort])
      .collation({ locale: 'en' })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(LIST_SELECT),
    Content.countDocuments(filter),
    Content.distinct('genres', { category: category.slug }),
  ]);

  res.json({
    category,
    genres: genres.sort((a, b) => a.localeCompare(b)),
    items,
    pagination: pagination(page, limit, total),
  });
};

/** GET /api/contents/search?q= */
export const searchContents = async (req, res) => {
  const { q, limit } = req.valid.query;
  const rx = new RegExp(escapeRegex(q), 'i');

  const results = await Content.find({ $or: [{ title: rx }, { artist: rx }, { genres: rx }] })
    .sort({ rating: -1 })
    .limit(limit)
    .select(LIST_SELECT);

  res.json({ query: q, total: results.length, results });
};

/** GET /api/contents/:slug */
export const getContent = async (req, res) => {
  const content = await Content.findOne({ slug: req.params.slug });
  if (!content) throw new ApiError(404, 'Content not found');
  res.json({ content });
};
