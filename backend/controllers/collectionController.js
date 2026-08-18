import Collection from '../models/Collection.js';
import Product from '../models/Product.js';

// GET /api/collections
export const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find().sort({ name: 1 });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/collections/:slug — collection info + its products (Module 8 frontend)
export const getCollectionBySlug = async (req, res) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug });
    if (!collection) return res.status(404).json({ error: 'Collection not found' });

    const products = await Product.find({ collections: collection._id }).populate('brand', 'name slug');
    res.json({ collection, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---- Admin: Collection CRUD (Module 8) ----

export const createCollection = async (req, res) => {
  try {
    const collection = await Collection.create(req.body);
    res.status(201).json(collection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json(collection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
