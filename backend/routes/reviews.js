import express from 'express';
import {
  submitReview, getAllReviewsAdmin, approveReview, rejectReview, deleteReview,
} from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', submitReview);
router.get('/admin/all', getAllReviewsAdmin);
router.patch('/admin/:id/approve', approveReview);
router.patch('/admin/:id/reject', rejectReview);
router.delete('/admin/:id', deleteReview);

export default router;
