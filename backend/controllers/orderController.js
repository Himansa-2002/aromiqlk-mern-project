import crypto from "crypto";
import mongoose from "mongoose";

import User from "../models/User.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import CouponUsage from "../models/CouponUsage.js";
import Order from "../models/Order.js";

import {
  calculateCouponDiscount,
  validateCouponForUser,
} from "./couponController.js";

import { calculateShipping } from "../services/shippingService.js";
import { emailService } from "../services/emailService.js";
// Force restart

const normalizeCouponCode = (code) => {
  if (typeof code !== "string") {
    return "";
  }

  return code.trim().toUpperCase();
};

const generateOrderNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");

  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `ARQ-${datePart}-${randomPart}`;
};

const getSelectedSize = (product, selectedSize = "") => {
  const normalizedSize =
    typeof selectedSize === "string" ? selectedSize.trim() : "";

  if (!normalizedSize) {
    return null;
  }

  return product.sizes.find((size) => size.label === normalizedSize);
};

const getProductPrice = (product, selectedSize = "") => {
  const selectedSizeData = getSelectedSize(product, selectedSize);

  const price = selectedSizeData ? selectedSizeData.price : product.price;

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    const error = new Error(`Invalid price for ${product.name}`);

    error.statusCode = 400;
    throw error;
  }

  return numericPrice;
};

const getAvailableStock = (product, selectedSize = "") => {
  const selectedSizeData = getSelectedSize(product, selectedSize);

  const stock = selectedSizeData ? selectedSizeData.stock : product.stock;

  const numericStock = Number(stock);

  if (Number.isNaN(numericStock) || numericStock < 0) {
    return 0;
  }

  return numericStock;
};

const createOrderItem = (cartItem) => {
  const product = cartItem.product;

  if (!product) {
    const error = new Error("One or more cart products no longer exist");

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

  const availableStock = getAvailableStock(product, selectedSize);

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

  const unitPrice = getProductPrice(product, selectedSize);

  const itemTotal = Number((unitPrice * cartItem.quantity).toFixed(2));

  return {
    product: product._id,
    name: product.name,
    slug: product.slug,
    image: product.images?.[0] || "",
    selectedSize,
    quantity: cartItem.quantity,
    unitPrice,
    itemTotal,
  };
};

// POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const {
      addressId,
      couponCode = "",
      paymentMethod,
      customerNote = "",
    } = req.body;

    if (!addressId) {
      res.status(400);

      throw new Error("Delivery address ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      res.status(400);

      throw new Error("Invalid delivery address ID");
    }

    const allowedPaymentMethods = ["cash_on_delivery", "card", "bank_transfer"];

    if (!paymentMethod || !allowedPaymentMethods.includes(paymentMethod)) {
      res.status(400);

      throw new Error("Valid payment method is required");
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

    const orderItems = cart.items.map(createOrderItem);

    const subtotal = Number(
      orderItems.reduce((total, item) => total + item.itemTotal, 0).toFixed(2),
    );

    let couponDocument = null;
    let couponSnapshot = null;
    let discountAmount = 0;

    const normalizedCouponCode = normalizeCouponCode(couponCode);

    if (normalizedCouponCode) {
      couponDocument = await Coupon.findOne({
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

      couponSnapshot = {
        couponId: couponDocument._id,
        code: couponDocument.code,
        discountType: couponDocument.discountType,
        discountValue: couponDocument.discountValue,
        discountAmount,
      };
    }

    const discountedSubtotal = Number((subtotal - discountAmount).toFixed(2));

    const shipping = await calculateShipping({
      district: deliveryAddress.district,
      subtotal: discountedSubtotal,
    });

    const shippingFee = Number(shipping.shippingFee);

    const grandTotal = Number((discountedSubtotal + shippingFee).toFixed(2));

    let orderNumber = generateOrderNumber();

    while (await Order.exists({ orderNumber })) {
      orderNumber = generateOrderNumber();
    }

    const order = await Order.create({
      orderNumber,

      user: user._id,

      customer: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },

      deliveryAddress: {
        addressId: deliveryAddress._id,
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

      items: orderItems,

      coupon: couponSnapshot,

      shipping: {
        ruleId: shipping.ruleId,
        ruleName: shipping.ruleName,
        district: shipping.district,
        shippingFee: shipping.shippingFee,
        freeShipping: shipping.freeShipping,
        estimatedDeliveryDays: {
          min: shipping.estimatedDeliveryDays.min,
          max: shipping.estimatedDeliveryDays.max,
        },
      },

      pricing: {
        subtotal,
        discountAmount,
        discountedSubtotal,
        shippingFee,
        grandTotal,
        currency: "LKR",
      },

      paymentMethod,

      paymentStatus:
        paymentMethod === "cash_on_delivery" ? "pending" : "pending",

      orderStatus: "pending",

      customerNote: typeof customerNote === "string" ? customerNote.trim() : "",
    });

    if (couponDocument) {
      await CouponUsage.create({
        coupon: couponDocument._id,
        user: user._id,
        order: order._id,
        discountAmount,
      });

      couponDocument.usedCount += 1;
      await couponDocument.save();
    }

    cart.items = [];
    await cart.save();

    // Fire off order confirmation in the background
    emailService.sendOrderConfirmationEmail(user, order);

    const responsePayload = {
      success: true,
      message: "Order placed successfully",

      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        deliveryAddress: order.deliveryAddress,
        items: order.items,
        coupon: order.coupon,
        shipping: order.shipping,
        pricing: order.pricing,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        customerNote: order.customerNote,
        placedAt: order.placedAt,
        createdAt: order.createdAt,
      },
    };

    // If Card Payment, Generate PayHere MD5 Hash Config
    if (paymentMethod === "card") {
      const merchantId = process.env.PAYHERE_MERCHANT_ID || "1210000"; // Dummy Sandbox ID
      const merchantSecret = process.env.PAYHERE_SECRET || "xyz_sandbox_secret";
      const amountFormatted = order.pricing.grandTotal.toFixed(2);

      const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
      const hashString = merchantId + order.orderNumber + amountFormatted + "LKR" + hashedSecret;
      const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

      responsePayload.payhereConfig = {
        merchant_id: merchantId,
        return_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/order-success`,
        cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/checkout`,
        notify_url: `${process.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/payments/webhook/payhere`,
        order_id: order.orderNumber,
        items: "Aromiq Fragrance Order",
        currency: "LKR",
        amount: amountFormatted,
        first_name: user.firstName || "Customer",
        last_name: user.lastName || "",
        email: user.email,
        phone: user.phone || "0700000000",
        address: order.deliveryAddress.street,
        city: order.deliveryAddress.city,
        country: "Sri Lanka",
        hash: hash
      };
    }

    return res.status(201).json(responsePayload);
  } catch (error) {
    return next(error);
  }
};
// GET /api/orders/me
export const getMyOrders = async (req, res, next) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      user: req.user._id,
    };

    const allowedStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (status) {
      if (!allowedStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid order status');
      }

      query.orderStatus = status;
    }

    const numericPage = Math.max(Number(page) || 1, 1);
    const numericLimit = Math.min(
      Math.max(Number(limit) || 10, 1),
      50
    );

    const skip = (numericPage - 1) * numericLimit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .select(
          'orderNumber items pricing paymentMethod paymentStatus orderStatus shipping placedAt createdAt'
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(numericLimit),

      Order.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: numericPage,
      pages: Math.ceil(total / numericLimit),
      orders,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/orders/:orderNumber
export const getOrderByNumber = async (
  req,
  res,
  next
) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({
      orderNumber: orderNumber.trim().toUpperCase(),
      user: req.user._id,
    }).populate({
      path: 'items.product',
      select:
        'name slug images brand category gender',
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

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/orders/:orderNumber/tracking
export const trackOrder = async (
  req,
  res,
  next
) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({
      orderNumber: orderNumber.trim().toUpperCase(),
      user: req.user._id,
    }).select(
      'orderNumber orderStatus paymentStatus trackingNumber shipping deliveryAddress placedAt createdAt updatedAt'
    );

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const statusSteps = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
    ];

    const currentStep = statusSteps.indexOf(
      order.orderStatus
    );

    const timeline = statusSteps.map(
      (status, index) => ({
        status,
        completed:
          currentStep >= 0 && index <= currentStep,
        current:
          currentStep >= 0 && index === currentStep,
      })
    );

    return res.status(200).json({
      success: true,
      tracking: {
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        trackingNumber:
          order.trackingNumber || null,
        shippingMethod:
          order.shipping.ruleName,
        estimatedDeliveryDays:
          order.shipping.estimatedDeliveryDays,
        deliveryDistrict:
          order.deliveryAddress.district,
        placedAt: order.placedAt,
        updatedAt: order.updatedAt,
        cancelled:
          order.orderStatus === 'cancelled',
        timeline:
          order.orderStatus === 'cancelled'
            ? timeline.map((item) => ({
              ...item,
              completed: false,
              current: false,
            }))
            : timeline,
      },
    });
  } catch (error) {
    return next(error);
  }
};
