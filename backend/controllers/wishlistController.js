import mongoose from 'mongoose';

import Wishlist from '../models/Wishlist.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const populateWishlist = async (wishlist) => {
  await wishlist.populate({
    path: 'items.product',
    select:
      'name slug price oldPrice images stock sizes brand category gender badge',
    populate: [
      {
        path: 'brand',
        select: 'name slug logo',
      },
      {
        path: 'category',
        select: 'name slug image',
      },
    ],
  });

  return wishlist;
};

const formatWishlist = (wishlist) => ({
  id: wishlist._id,
  user: wishlist.user,
  items: wishlist.items.map((item) => ({
    id: item._id,
    product: item.product,
    selectedSize: item.selectedSize,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  })),
  totalItems: wishlist.items.length,
  createdAt: wishlist.createdAt,
  updatedAt: wishlist.updatedAt,
});

const findOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      items: [],
    });
  }

  return wishlist;
};

const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return cart;
};

const getSelectedSize = (
  product,
  selectedSize = ''
) => {
  const normalizedSize =
    typeof selectedSize === 'string'
      ? selectedSize.trim()
      : '';

  if (!normalizedSize) {
    return null;
  }

  return product.sizes.find(
    (size) => size.label === normalizedSize
  );
};

const validateSelectedSize = (
  product,
  selectedSize = ''
) => {
  const normalizedSize =
    typeof selectedSize === 'string'
      ? selectedSize.trim()
      : '';

  if (
    Array.isArray(product.sizes) &&
    product.sizes.length > 0 &&
    !normalizedSize
  ) {
    const error = new Error(
      'Please select a product size'
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    normalizedSize &&
    Array.isArray(product.sizes) &&
    product.sizes.length > 0
  ) {
    const selectedSizeData = getSelectedSize(
      product,
      normalizedSize
    );

    if (!selectedSizeData) {
      const error = new Error(
        'Selected product size is invalid'
      );

      error.statusCode = 400;
      throw error;
    }
  }

  return normalizedSize;
};

const getProductPrice = (
  product,
  selectedSize = ''
) => {
  const selectedSizeData = getSelectedSize(
    product,
    selectedSize
  );

  const price = selectedSizeData
    ? selectedSizeData.price
    : product.price;

  const numericPrice = Number(price);

  if (
    Number.isNaN(numericPrice) ||
    numericPrice < 0
  ) {
    throw new Error('Product has an invalid price');
  }

  return numericPrice;
};

const getAvailableStock = (
  product,
  selectedSize = ''
) => {
  const selectedSizeData = getSelectedSize(
    product,
    selectedSize
  );

  const stock = selectedSizeData
    ? selectedSizeData.stock
    : product.stock;

  const numericStock = Number(stock);

  if (
    Number.isNaN(numericStock) ||
    numericStock < 0
  ) {
    return 0;
  }

  return numericStock;
};

// GET /api/wishlist
export const getWishlist = async (
  req,
  res,
  next
) => {
  try {
    const wishlist = await findOrCreateWishlist(
      req.user._id
    );

    await populateWishlist(wishlist);

    return res.status(200).json({
      success: true,
      wishlist: formatWishlist(wishlist),
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/wishlist/items
export const addWishlistItem = async (
  req,
  res,
  next
) => {
  try {
    const {
      productId,
      selectedSize = '',
    } = req.body;

    if (!productId) {
      res.status(400);
      throw new Error('Product ID is required');
    }

    if (
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      res.status(400);
      throw new Error('Invalid product ID');
    }

    const product = await Product.findById(
      productId
    );

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    let normalizedSize;

    try {
      normalizedSize = validateSelectedSize(
        product,
        selectedSize
      );
    } catch (error) {
      res.status(error.statusCode || 400);
      throw error;
    }

    const wishlist = await findOrCreateWishlist(
      req.user._id
    );

    const existingItem = wishlist.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.selectedSize === normalizedSize
    );

    if (existingItem) {
      res.status(409);
      throw new Error(
        'Product is already in the wishlist'
      );
    }

    wishlist.items.push({
      product: productId,
      selectedSize: normalizedSize,
    });

    await wishlist.save();
    await populateWishlist(wishlist);

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: formatWishlist(wishlist),
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/wishlist/items/:productId
export const removeWishlistItem = async (
  req,
  res,
  next
) => {
  try {
    const { productId } = req.params;
    const { selectedSize = '' } = req.query;

    if (
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      res.status(400);
      throw new Error('Invalid product ID');
    }

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      res.status(404);
      throw new Error('Wishlist not found');
    }

    const normalizedSize =
      typeof selectedSize === 'string'
        ? selectedSize.trim()
        : '';

    const itemIndex = wishlist.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.selectedSize === normalizedSize
    );

    if (itemIndex === -1) {
      res.status(404);
      throw new Error('Wishlist item not found');
    }

    wishlist.items.splice(itemIndex, 1);

    await wishlist.save();
    await populateWishlist(wishlist);

    return res.status(200).json({
      success: true,
      message:
        'Product removed from wishlist',
      wishlist: formatWishlist(wishlist),
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/wishlist/items/:productId/move-to-cart
export const moveWishlistItemToCart = async (
  req,
  res,
  next
) => {
  try {
    const { productId } = req.params;

    const {
      quantity = 1,
      selectedSize = '',
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      res.status(400);
      throw new Error('Invalid product ID');
    }

    const numericQuantity = Number(quantity);

    if (
      !Number.isInteger(numericQuantity) ||
      numericQuantity < 1
    ) {
      res.status(400);
      throw new Error(
        'Quantity must be a positive whole number'
      );
    }

    const product = await Product.findById(
      productId
    );

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    let normalizedSize;

    try {
      normalizedSize = validateSelectedSize(
        product,
        selectedSize
      );
    } catch (error) {
      res.status(error.statusCode || 400);
      throw error;
    }

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      res.status(404);
      throw new Error('Wishlist not found');
    }

    const wishlistItem = wishlist.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.selectedSize === normalizedSize
    );

    if (!wishlistItem) {
      res.status(404);
      throw new Error('Wishlist item not found');
    }

    const availableStock = getAvailableStock(
      product,
      normalizedSize
    );

    if (availableStock <= 0) {
      res.status(400);
      throw new Error(
        'This product is currently out of stock'
      );
    }

    const cart = await findOrCreateCart(
      req.user._id
    );

    const existingCartItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.selectedSize === normalizedSize
    );

    const requestedTotalQuantity =
      existingCartItem
        ? existingCartItem.quantity +
          numericQuantity
        : numericQuantity;

    if (
      requestedTotalQuantity > availableStock
    ) {
      res.status(400);
      throw new Error(
        `Only ${availableStock} item(s) are available`
      );
    }

    const unitPrice = getProductPrice(
      product,
      normalizedSize
    );

    if (existingCartItem) {
      existingCartItem.quantity =
        requestedTotalQuantity;

      existingCartItem.unitPrice = unitPrice;
    } else {
      cart.items.push({
        product: productId,
        quantity: numericQuantity,
        selectedSize: normalizedSize,
        unitPrice,
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) =>
        !(
          item.product.toString() ===
            productId &&
          item.selectedSize === normalizedSize
        )
    );

    await cart.save();
    await wishlist.save();

    await populateWishlist(wishlist);

    return res.status(200).json({
      success: true,
      message:
        'Product moved from wishlist to cart',
      wishlist: formatWishlist(wishlist),
      cart: {
        id: cart._id,
        items: cart.items,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/wishlist
export const clearWishlist = async (
  req,
  res,
  next
) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: 'Wishlist is already empty',
        wishlist: {
          items: [],
          totalItems: 0,
        },
      });
    }

    wishlist.items = [];

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message:
        'Wishlist cleared successfully',
      wishlist: formatWishlist(wishlist),
    });
  } catch (error) {
    return next(error);
  }
};