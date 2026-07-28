import express from 'express';

import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getCart)
  .delete(clearCart);

router.post('/items', addCartItem);

router
  .route('/items/:itemId')
  .put(updateCartItem)
  .delete(removeCartItem);

export default router;