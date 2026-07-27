import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name:  { type: String, required: true },        // e.g. "Men's Collection", "Luxury Gift Sets"
  slug:  { type: String, required: true, unique: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  featured: { type: Boolean, default: false },      // shown in the homepage "Featured Collections" grid
}, { timestamps: true });

export default mongoose.model('Collection', collectionSchema);
