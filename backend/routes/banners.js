import express from 'express';
import {
  getActiveBanners, getAllBannersAdmin, createBanner, updateBanner, deleteBanner,
} from '../controllers/bannerController.js';

const router = express.Router();

router.get('/', getActiveBanners);
router.get('/admin/all', getAllBannersAdmin);
router.post('/admin', createBanner);
router.put('/admin/:id', updateBanner);
router.delete('/admin/:id', deleteBanner);

export default router;
