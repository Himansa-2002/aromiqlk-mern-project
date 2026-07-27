import Product from '../models/Product.js';
import Review from '../models/Review.js';

// GET /api/products
// Handles: Product Listing, Product Search, Product Filter, Product Sorting, Pagination
export const getProducts = async (req, res) => {
  try {
    const {
      brand, category, gender, tag, search,
      minPrice, maxPrice,
      sort = 'default',
      page = 1, limit = 12,
    } = req.query;

    const filter = {};
    if (brand) filter.brand = brand;           // expects Brand ObjectId
    if (category) filter.category = category;
    if (gender) filter.gender = gender;
    if (tag) filter.tags = tag;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'new') sortOption = { createdAt: -1 };
    else if (sort === 'bestseller') sortOption = { bestSeller: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate('brand', 'name slug')
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      items,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/:slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('brand', 'name slug')
      .populate('category', 'name slug')
      .populate('collections', 'name slug');

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/:id/related
export const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
    })
      .populate('brand', 'name slug')
      .limit(4);

    res.json(related);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/:id/reviews
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id, status: 'approved' })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---- Admin: Product Management (Module 10) ----

// GET /api/admin/products
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('brand', 'name')
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/products
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/admin/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/admin/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
