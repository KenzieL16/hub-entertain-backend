import mongoose from 'mongoose';
import { categoryBySlug, subtitleFor } from '../data/categories.js';

const creditSchema = new mongoose.Schema({ label: String, value: String }, { _id: false });

const contentSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true }, // dipakai sebagai `id` di API
    category: { type: String, required: true, enum: ['movies', 'series', 'music'], index: true },
    order: { type: Number, default: 0 },
    isHero: { type: Boolean, default: false },

    title: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    genre: String, // genre utama (film)
    genres: { type: [String], default: [] },
    rating: { type: Number, min: 0, max: 10, default: 0 },
    image: String,
    tagline: String,
    synopsis: String,
    credits: { type: [creditSchema], default: [] },

    // spesifik per kategori
    rated: String,    // film
    duration: String, // film
    info: String,     // serial: "2008–2013 • 5 seasons", musik: "Album" / "Single"
    artist: String,   // musik

    // tampilan halaman detail
    tag: String,
    badge: String,
    trailerTime: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret.slug;
        delete ret._id;
        delete ret.__v;
        delete ret.slug;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.order;
        return ret;
      },
    },
  }
);

contentSchema.index({ category: 1, order: 1 });
contentSchema.index({ isHero: 1 });

// Field turunan, supaya frontend tidak perlu menghitung lagi
contentSchema.virtual('type').get(function () {
  return categoryBySlug[this.category]?.typeLabel;
});
contentSchema.virtual('subtitle').get(function () {
  return subtitleFor(this);
});
contentSchema.virtual('ratingsCount').get(function () {
  return `${Math.round(this.rating * 14)}k ratings`;
});
contentSchema.virtual('breadcrumb').get(function () {
  return `Home > ${categoryBySlug[this.category]?.typeLabel} > ${this.title}`;
});

export const Content = mongoose.model('Content', contentSchema);
