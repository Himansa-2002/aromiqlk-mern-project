import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * Convert the cart document into a frontend-friendly response.
 */
const calculateCartSummary = (cart) => {
  const items = cart.items.map((item) => {
    const itemTotal = Number(
      (item.unitPrice * item.quantity).toFixed(2)
    );

    return {
      id: item._id,
      product: item.product,
      quantity: item.quantity,
      selectedSize: item.selectedSize,
      unitPrice: item.unitPrice,
      itemTotal,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = Number(
    items
      .reduce((total, item) => total + item.itemTotal, 0)
      .toFixed(2)
  );

  return {
    id: cart._id,
    user: cart.user,
    items,
    totalItems: items.length,
    totalQuantity,
    subtotal,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};

/**
 * Populate product information inside cart items.
 */
const populateCart = async (cart) => {
  await cart.populate({
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

  return cart;
};

/**
 * Find the logged-in user's cart or create a new one.
 */
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

/**
 * Find the selected product size.
 */
const getSelectedSize = (product, selectedSize = '') => {
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

/**
 * Get the price based on selected size.
 * If no size is selected, use the product base price.
 */
const getProductPrice = (product, selectedSize = '') => {
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

/**
 * Get available stock based on selected size.
 * If no size is selected, use product-level stock.
 */
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

/**
 * Validate the selected size.
 */
const validateSelectedSize = (
  product,
  selectedSize
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

/**
 * GET /api/cart
 */
export const getCart = async (req, res, next) => {
  try {
    const cart = await findOrCreateCart(
      req.user._id
    );

    await populateCart(cart);

    return res.status(200).json({
      success: true,
      cart: calculateCartSummary(cart),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/cart/items
 */
export const addCartItem = async (
  req,
  res,
  next
) => {
  try {
    const {
      productId,
      quantity = 1,
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

    const unitPrice = getProductPrice(
      product,
      normalizedSize
    );

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

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.selectedSize === normalizedSize
    );

    const requestedTotalQuantity = existingItem
      ? existingItem.quantity + numericQuantity
      : numericQuantity;

    if (
      requestedTotalQuantity > availableStock
    ) {
      res.status(400);
      throw new Error(
        `Only ${availableStock} item(s) are available`
      );
    }

    if (existingItem) {
      existingItem.quantity =
        requestedTotalQuantity;

      existingItem.unitPrice = unitPrice;
    } else {
      cart.items.push({
        product: productId,
        quantity: numericQuantity,
        selectedSize: normalizedSize,
        unitPrice,
      });
    }

    await cart.save();
    await populateCart(cart);

    return res.status(201).json({
      success: true,
      message: existingItem
        ? 'Cart item quantity updated'
        : 'Product added to cart',
      cart: calculateCartSummary(cart),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/cart/items/:itemId
 */
export const updateCartItem = async (
  req,
  res,
  next
) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      res.status(400);
      throw new Error('Invalid cart item ID');
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

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    const cartItem = cart.items.find(
      (item) =>
        item._id.toString() === itemId
    );

    if (!cartItem) {
      res.status(404);
      throw new Error('Cart item not found');
    }

    const product = await Product.findById(
      cartItem.product
    );

    if (!product) {
      res.status(404);
      throw new Error(
        'Product no longer exists'
      );
    }

    const selectedSize =
      cartItem.selectedSize || '';

    if (
      Array.isArray(product.sizes) &&
      product.sizes.length > 0
    ) {
      const selectedSizeData =
        getSelectedSize(
          product,
          selectedSize
        );

      if (!selectedSizeData) {
        res.status(400);
        throw new Error(
          'Selected product size is no longer available'
        );
      }
    }

    const availableStock =
      getAvailableStock(
        product,
        selectedSize
      );

    if (availableStock <= 0) {
      res.status(400);
      throw new Error(
        'This product is currently out of stock'
      );
    }

    if (numericQuantity > availableStock) {
      res.status(400);
      throw new Error(
        `Only ${availableStock} item(s) are available`
      );
    }

    cartItem.quantity = numericQuantity;

    cartItem.unitPrice = getProductPrice(
      product,
      selectedSize
    );

    await cart.save();
    await populateCart(cart);

    return res.status(200).json({
      success: true,
      message:
        'Cart item updated successfully',
      cart: calculateCartSummary(cart),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/cart/items/:itemId
 */
export const removeCartItem = async (
  req,
  res,
  next
) => {
  try {
    const { itemId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(itemId)
    ) {
      res.status(400);
      throw new Error('Invalid cart item ID');
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    const cartItem = cart.items.find(
      (item) =>
        item._id.toString() === itemId
    );

    if (!cartItem) {
      res.status(404);
      throw new Error('Cart item not found');
    }

    cart.items.pull(itemId);

    await cart.save();
    await populateCart(cart);

    return res.status(200).json({
      success: true,
      message:
        'Cart item removed successfully',
      cart: calculateCartSummary(cart),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/cart
 */
export const clearCart = async (
  req,
  res,
  next
) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: 'Cart is already empty',
        cart: {
          items: [],
          totalItems: 0,
          totalQuantity: 0,
          subtotal: 0,
        },
      });
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: calculateCartSummary(cart),
    });
  } catch (error) {
    return next(error);
  }
};