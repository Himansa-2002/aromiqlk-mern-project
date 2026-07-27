import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone:    { type: String, default: '' },
  email:    { type: String, required: true },
  subject:  { type: String, default: '' },
  message:  { type: String, required: true },

  status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
  notes:  { type: String, default: '' },   // internal admin notes
}, { timestamps: true });

export default mongoose.model('ContactMessage', contactMessageSchema);
