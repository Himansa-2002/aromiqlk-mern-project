import express from 'express';

import {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router
  .route('/profile')
  .get(getProfile)
  .put(updateProfile);

router
  .route('/addresses')
  .get(getAddresses)
  .post(addAddress);

router
  .route('/addresses/:addressId')
  .put(updateAddress)
  .delete(deleteAddress);

router.patch(
  '/addresses/:addressId/default',
  setDefaultAddress
);

export default router;