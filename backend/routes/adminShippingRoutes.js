import express from 'express';

import {
  getShippingRules,
  createShippingRule,
  updateShippingRule,
  deleteShippingRule,
} from '../controllers/shippingController.js';

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
  .get(getShippingRules)
  .post(createShippingRule);

router
  .route('/:id')
  .patch(updateShippingRule)
  .delete(deleteShippingRule);

export default router;