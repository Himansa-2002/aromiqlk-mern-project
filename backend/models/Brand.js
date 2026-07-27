import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name:  { type: String, required: true },        // e.g. "Lattafa", "Armaf"
  slug:  { type: String, required: true, unique: true },
  logo:  { type: String, default: '' },
  description: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Brand', brandSchema);
