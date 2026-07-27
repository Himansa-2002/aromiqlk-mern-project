import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name:  { type: String, required: true },       // e.g. "Perfume Oils", "Decants"
  slug:  { type: String, required: true, unique: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
