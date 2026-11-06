import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    pageTitle: { type: String, required: true },
    typeLabel: { type: String, required: true },
    description: { type: String, default: '' },
    square: { type: Boolean, default: false },
    showPlay: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Category = mongoose.model('Category', categorySchema);
