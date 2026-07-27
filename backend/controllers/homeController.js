import Product from '../models/Product.js';
import Collection from '../models/Collection.js';

// GET /api/home
export const getHomeData = async (req, res) => {
  try {
    const [featuredCollections, newArrivals, bestSellers] = await Promise.all([
      Collection.find({ featured: true }),
      Product.find({ newArrival: true }).populate('brand', 'name slug').limit(4),
      Product.find({ bestSeller: true }).populate('brand', 'name slug').limit(4),
    ]);

    res.json({ featuredCollections, newArrivals, bestSellers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
