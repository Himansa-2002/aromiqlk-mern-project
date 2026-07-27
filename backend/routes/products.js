import express from 'express';
import {
  getProducts, getProductBySlug, getRelatedProducts, getProductReviews,
  getAllProductsAdmin, createProduct, updateProduct, deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/admin/all', getAllProductsAdmin);
router.post('/admin', createProduct);
router.put('/admin/:id', updateProduct);
router.delete('/admin/:id', deleteProduct);

router.get('/:id/related', getRelatedProducts);
router.get('/:id/reviews', getProductReviews);
router.get('/:slug', getProductBySlug);

export default router;
