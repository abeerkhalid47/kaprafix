import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  name: string;
  location: string;
  rating: number;
  text: string;
  imageUrls: string[];
  label: string;
  initials: string;
  status: 'published' | 'pending';
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, trim: true, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    text: { type: String, required: true, trim: true },
    imageUrls: { type: [String], default: [] },
    label: { type: String, trim: true, default: '' },
    // initials are computed in the API route before saving
    initials: { type: String, default: '' },
    status: { type: String, enum: ['published', 'pending'], default: 'published' },
  },
  { timestamps: true }
);

const Review: Model<IReview> =
  (mongoose.models.Review as Model<IReview>) ??
  mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
