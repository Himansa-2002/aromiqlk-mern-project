import express from 'express';
import {
  subscribe, unsubscribe, getSubscribers, exportSubscribers,
} from '../controllers/newsletterController.js';

const router = express.Router();

router.post('/', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/admin/subscribers', getSubscribers);
router.get('/admin/export', exportSubscribers);

export default router;
