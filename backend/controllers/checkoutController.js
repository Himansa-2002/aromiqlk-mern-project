import mongoose from "mongoose";

import User from "../models/User.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";

import {
  calculateCouponDiscount,
  validateCouponForUser,
} from "./couponController.js";

import { calculateShipping } from "../services/shippingService.js";

const normalizeCouponCode = (code) => {
  if (typeof code !== "string") {
    return "";
  }

  return code.trim().toUpperCase();
};

const getSelectedSize = (product, selectedSize = "") => {
  const normalizedSize =
    typeof selectedSize === "string" ? selectedSize.trim() : "";

  if (!normalizedSize) {
    return null;
  }

  return product.sizes.find((size) => size.label === normalizedSize);
};

const getCurrentPrice = (product, selectedSize = "") => {
  const selectedSizeData = getSelectedSize(product, selectedSize);

  const price = selectedSizeData ? selectedSizeData.price : product.price;

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    const error = new Error(`Invalid price for product: ${product.name}`);

    error.statusCode = 400;
    throw error;
  }

  return numericPrice;
};

const getCurrentStock = (product, selectedSize = "") => {
  const selectedSizeData = getSelectedSize(product, selectedSize);

  const stock = selectedSizeData ? selectedSizeData.stock : product.stock;

  const numericStock = Number(stock);

  if (Number.isNaN(numericStock) || numericStock < 0) {
    return 0;
  }

  return numericStock;
};

const validateCartItem = (cartItem) => {
  const product = cartItem.product;

  if (!product) {
    const error = new Error("One or more products no longer exist");

    error.statusCode = 400;
    throw error;
  }

  const selectedSize = cartItem.selectedSize?.trim() || "";

  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    if (!selectedSize) {
      const error = new Error(`Please select a size for ${product.name}`);

      error.statusCode = 400;
      throw error;
    }

    const selectedSizeData = getSelectedSize(product, selectedSize);

    if (!selectedSizeData) {
      const error = new Error(
        `Selected size is unavailable for ${product.name}`,
      );

      error.statusCode = 400;
      throw error;
    }
  }

  const availableStock = getCurrentStock(product, selectedSize);

  if (availableStock <= 0) {
    const error = new Error(`${product.name} is out of stock`);

    error.statusCode = 400;
    throw error;
  }

  if (cartItem.quantity > availableStock) {
    const error = new Error(
      `Only ${availableStock} item(s) of ${product.name} are available`,
    );

    error.statusCode = 400;
    throw error;
  }

  const unitPrice = getCurrentPrice(product, selectedSize);

  const itemTotal = Number((unitPrice * cartItem.quantity).toFixed(2));

  return {
    cartItemId: cartItem._id,
    productId: product._id,
    name: product.name,
    slug: product.slug,
    image: product.images?.[0] || "",
    selectedSize,
    quantity: cartItem.quantity,
    unitPrice,
    itemTotal,
    availableStock,
  };
};

// POST /api/checkout/summary
export const getCheckoutSummary = async (req, res, next) => {
  try {
    const { addressId, couponCode = "" } = req.body;

    if (!addressId) {
      res.status(400);
      throw new Error("Delivery address ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      res.status(400);
      throw new Error("Invalid delivery address ID");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const deliveryAddress = user.addresses.id(addressId);

    if (!deliveryAddress) {
      res.status(404);
      throw new Error("Delivery address not found");
    }

    if (
      !deliveryAddress.fullName ||
      !deliveryAddress.phone ||
      !deliveryAddress.addressLine1 ||
      !deliveryAddress.city ||
      !deliveryAddress.district
    ) {
      res.status(400);
      throw new Error("Delivery address is incomplete");
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate({
      path: "items.product",
      select:
        "name slug price oldPrice images stock sizes brand category gender",
    });

    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error("Your cart is empty");
    }

    const checkoutItems = cart.items.map(validateCartItem);

    const subtotal = Number(
      checkoutItems
        .reduce((total, item) => total + item.itemTotal, 0)
        .toFixed(2),
    );

    let coupon = null;
    let discountAmount = 0;

    const normalizedCouponCode = normalizeCouponCode(couponCode);

    if (normalizedCouponCode) {
      const couponDocument = await Coupon.findOne({
        code: normalizedCouponCode,
      });

      if (!couponDocument) {
        res.status(404);
        throw new Error("Invalid coupon code");
      }

      try {
        await validateCouponForUser({
          coupon: couponDocument,
          userId: req.user._id,
          subtotal,
        });
      } catch (error) {
        res.status(error.statusCode || 400);
        throw error;
      }

      discountAmount = calculateCouponDiscount(couponDocument, subtotal);

      coupon = {
        id: couponDocument._id,
        code: couponDocument.code,
        description: couponDocument.description,
        discountType: couponDocument.discountType,
        discountValue: couponDocument.discountValue,
      };
    }

    const discountedSubtotal = Number((subtotal - discountAmount).toFixed(2));

    const shipping = await calculateShipping({
      district: deliveryAddress.district,
      subtotal: discountedSubtotal,
    });

    const shippingFee = Number(shipping.shippingFee);

    const grandTotal = Number((discountedSubtotal + shippingFee).toFixed(2));

    return res.status(200).json({
      success: true,
      message: "Checkout summary generated successfully",

      customer: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },

      deliveryAddress: {
        id: deliveryAddress._id,
        label: deliveryAddress.label,
        fullName: deliveryAddress.fullName,
        phone: deliveryAddress.phone,
        addressLine1: deliveryAddress.addressLine1,
        addressLine2: deliveryAddress.addressLine2,
        city: deliveryAddress.city,
        district: deliveryAddress.district,
        postalCode: deliveryAddress.postalCode,
        country: deliveryAddress.country,
      },

      items: checkoutItems,

      coupon,

      shipping,

      pricing: {
        subtotal,
        discountAmount,
        discountedSubtotal,
        shippingFee,
        grandTotal,
      },
    });
  } catch (error) {
    return next(error);
  }
};
