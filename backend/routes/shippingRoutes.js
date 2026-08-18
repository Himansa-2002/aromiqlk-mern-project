import express from 'express';

import {
  calculateShippingFee,
} from '../controllers/shippingController.js';

import {
  protect,
} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/calculate',
  protect,
  calculateShippingFee
);

export default router;