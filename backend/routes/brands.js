import express from 'express';
import {
  getBrands, getBrandBySlug, createBrand, updateBrand, deleteBrand,
} from '../controllers/brandController.js';

const router = express.Router();

router.get('/', getBrands);
router.get('/:slug', getBrandBySlug);
router.post('/admin', createBrand);
router.put('/admin/:id', updateBrand);
router.delete('/admin/:id', deleteBrand);

export default router;
