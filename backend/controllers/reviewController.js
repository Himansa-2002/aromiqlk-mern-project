import Review from '../models/Review.js';
import Product from '../models/Product.js';

// POST /api/reviews
export const submitReview = async (req, res) => {
  try {
    const { product, name, rating, comment } = req.body;
    if (!product || !name || !rating || !comment) {
      return res.status(400).json({ error: 'product, name, rating, and comment are required.' });
    }
    const review = await Review.create({ product, name, rating, comment });
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---- Admin: Review Moderation (Module 9) ----

// GET /api/admin/reviews
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find().populate('product', 'name slug').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/reviews/:id/approve
export const approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    // Recalculate the product's rating average + review count
    const approved = await Review.find({ product: review.product, status: 'approved' });
    const avgRating = approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
    await Product.findByIdAndUpdate(review.product, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: approved.length,
    });

    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/reviews/:id/reject
export const rejectReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/admin/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
