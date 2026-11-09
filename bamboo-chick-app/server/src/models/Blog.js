import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    coverImage: { type: String, default: '' },         // optional uploaded cover picture (URL)
    tone: { type: String, default: 'natural' },        // cover swatch colour (used when no coverImage)
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Blog', blogSchema);
