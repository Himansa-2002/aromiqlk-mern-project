import express from 'express';
import {
  getCollections, getCollectionBySlug, createCollection, updateCollection, deleteCollection,
} from '../controllers/collectionController.js';

const router = express.Router();

router.get('/', getCollections);
router.get('/:slug', getCollectionBySlug);
router.post('/admin', createCollection);
router.put('/admin/:id', updateCollection);
router.delete('/admin/:id', deleteCollection);

export default router;
