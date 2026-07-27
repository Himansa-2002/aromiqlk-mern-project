import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
  label: { type: String, required: true },   // e.g. "5ml Decant", "Full Bottle 100ml"
  price: { type: Number, required: true },
  stock: { type: Number, default: 50 },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  slug:  { type: String, required: true, unique: true },   // used by GET /api/products/:slug

  brand:      { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  category:   { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],

  gender: { type: String, enum: ["Men's", "Women's", "Unisex"], required: true },

  price:    { type: Number, required: true },     // base/display price
  oldPrice: { type: Number, default: null },        // drives "Sale" badge / strikethrough

  rating:      { type: Number, min: 0, max: 5, default: 5 },
  reviewCount: { type: Number, default: 0 },

  badge: { type: String, default: null },            // "New", "Sale", "Best Seller"
  tags:  [{ type: String }],                          // "new", "bestseller", "popular" — drives Shop filters

  description: { type: String, default: '' },
  notes: {
    top:    { type: String, default: '' },
    middle: { type: String, default: '' },
    base:   { type: String, default: '' },
  },

  sizes:  [sizeSchema],
  images: [{ type: String }],

  featured:   { type: Boolean, default: false },   // homepage "Featured" flag
  newArrival: { type: Boolean, default: false },
  bestSeller: { type: Boolean, default: false },

  stock: { type: Number, default: 50 },

  seo: {
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
  },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });   // powers Product Search API

export default mongoose.model('Product', productSchema);
