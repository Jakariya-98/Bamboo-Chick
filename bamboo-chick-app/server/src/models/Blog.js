import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    tone: { type: String, default: 'natural' },        // cover swatch colour
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Blog', blogSchema);
