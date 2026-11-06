import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    content: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// Satu user hanya boleh punya satu review per konten
reviewSchema.index({ content: 1, user: 1 }, { unique: true });
reviewSchema.index({ content: 1, createdAt: -1 });

export const Review = mongoose.model('Review', reviewSchema);
