import express from 'express';

import {
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '../controllers/couponController.js';

import {
  protect,
} from '../middleware/authMiddleware.js';

import {
  adminOnly,
} from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router
  .route('/')
  .get(getAdminCoupons)
  .post(createCoupon);

router
  .route('/:id')
  .patch(updateCoupon)
  .delete(deleteCoupon);

export default router;