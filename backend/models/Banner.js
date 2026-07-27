import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  desktopImage: { type: String, required: true },
  mobileImage:  { type: String, default: '' },
  ctaText:      { type: String, default: '' },
  ctaLink:      { type: String, default: '' },

  active:    { type: Boolean, default: true },
  startDate: { type: Date, default: null },   // for Schedule Banner
  endDate:   { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('Banner', bannerSchema);
