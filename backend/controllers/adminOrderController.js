import mongoose from "mongoose";

import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

import {
  decreaseOrderInventory,
  restoreOrderInventory,
} from "../services/inventoryService.js";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * GET /api/admin/orders
 */
export const getAdminOrders = async (req, res, next) => {
  try {
    const {
      search = "",
      orderStatus,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sort = "newest",
    } = req.query;

    const query = {};

    if (orderStatus) {
      if (!ORDER_STATUSES.includes(orderStatus)) {
        res.status(400);
        throw new Error("Invalid order status");
      }

      query.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      if (!PAYMENT_STATUSES.includes(paymentStatus)) {
        res.status(400);
        throw new Error("Invalid payment status");
      }

      query.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (search.trim()) {
      const normalizedSearch = search.trim();

      query.$or = [
        {
          orderNumber: {
            $regex: normalizedSearch,
            $options: "i",
          },
        },
        {
          "customer.firstName": {
            $regex: normalizedSearch,
            $options: "i",
          },
        },
        {
          "customer.lastName": {
            $regex: normalizedSearch,
            $options: "i",
          },
        },
        {
          "customer.email": {
            $regex: normalizedSearch,
            $options: "i",
          },
        },
        {
          "customer.phone": {
            $regex: normalizedSearch,
            $options: "i",
          },
        },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        const parsedStartDate = new Date(startDate);

        if (Number.isNaN(parsedStartDate.getTime())) {
          res.status(400);
          throw new Error("Invalid start date");
        }

        query.createdAt.$gte = parsedStartDate;
      }

      if (endDate) {
        const parsedEndDate = new Date(endDate);

        if (Number.isNaN(parsedEndDate.getTime())) {
          res.status(400);
          throw new Error("Invalid end date");
        }

        parsedEndDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = parsedEndDate;
      }
    }

    const numericPage = Math.max(Number(page) || 1, 1);

    const numericLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (numericPage - 1) * numericLimit;

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { "pricing.grandTotal": -1 },
      lowest: { "pricing.grandTotal": 1 },
    };

    const selectedSort = sortOptions[sort] || sortOptions.newest;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .select(
          "orderNumber customer items pricing paymentMethod paymentStatus orderStatus inventoryStatus trackingNumber placedAt createdAt updatedAt",
        )
        .sort(selectedSort)
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

/**
 * GET /api/admin/orders/:id
 */
export const getAdminOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid order ID");
    }

    const order = await Order.findById(id)
      .populate({
        path: "user",
        select: "firstName lastName email phone role isActive addresses",
      })
      .populate({
        path: "items.product",
        select: "name slug images brand category gender stock sizes",
        populate: [
          {
            path: "brand",
            select: "name slug logo",
          },
          {
            path: "category",
            select: "name slug image",
          },
        ],
      })
      .populate({
        path: "coupon.couponId",
        select: "code description discountType discountValue isActive",
      })
      .populate({
        path: "shipping.ruleId",
        select: "name districts shippingFee freeShippingThreshold",
      });

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const payments = await Payment.find({
      order: order._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      order,
      payments,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/admin/orders/:id/status
 */
export const updateAdminOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid order ID");
    }

    if (!status || !ORDER_STATUSES.includes(status)) {
      res.status(400);
      throw new Error("A valid order status is required");
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const currentStatus = order.orderStatus;

    if (currentStatus === status) {
      return res.status(200).json({
        success: true,
        message: `Order is already ${status}`,
        order,
      });
    }

    const allowedNextStatuses = STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedNextStatuses.includes(status)) {
      res.status(400);

      throw new Error(
        `Cannot change order status from ${currentStatus} to ${status}`,
      );
    }

    /*
     * Confirmed COD orders must reserve/decrease stock.
     */
    if (
      status === "confirmed" &&
      order.paymentMethod === "cash_on_delivery" &&
      order.inventoryStatus === "pending"
    ) {
      try {
        await decreaseOrderInventory({
          order,
          performedBy: req.user._id,
        });
      } catch (error) {
        res.status(error.statusCode || 400);
        throw error;
      }
    }

    /*
     * Paid card/bank-transfer orders may already have inventory decreased.
     * If not, decrease it when the admin confirms the order.
     */
    if (
      status === "confirmed" &&
      order.paymentStatus === "paid" &&
      order.inventoryStatus === "pending"
    ) {
      try {
        await decreaseOrderInventory({
          order,
          performedBy: req.user._id,
        });
      } catch (error) {
        res.status(error.statusCode || 400);
        throw error;
      }
    }

    /*
     * Restore stock when cancelling an order whose stock
     * has already been decreased.
     */
    if (status === "cancelled" && order.inventoryStatus === "decreased") {
      try {
        await restoreOrderInventory({
          order,
          performedBy: req.user._id,
        });
      } catch (error) {
        res.status(error.statusCode || 400);
        throw error;
      }
    }

    order.orderStatus = status;

    if (status === "shipped" && !order.trackingNumber) {
      res.status(400);

      throw new Error(
        "Add a tracking number before marking the order as shipped",
      );
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        inventoryStatus: order.inventoryStatus,
        trackingNumber: order.trackingNumber,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/admin/orders/:id/payment-status
 */
export const updateAdminPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      status,
      transactionId,
      providerReference = "",
      failureReason = "",
    } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid order ID");
    }

    if (!status || !PAYMENT_STATUSES.includes(status)) {
      res.status(400);
      throw new Error("A valid payment status is required");
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.orderStatus === "cancelled" && status === "paid") {
      res.status(400);

      throw new Error("Cannot mark a cancelled order as paid");
    }

    const previousPaymentStatus = order.paymentStatus;

    order.paymentStatus = status;

    if (status === "paid" && order.orderStatus === "pending") {
      order.orderStatus = "confirmed";
    }

    if (status === "paid" && order.inventoryStatus === "pending") {
      try {
        await decreaseOrderInventory({
          order,
          performedBy: req.user._id,
        });
      } catch (error) {
        res.status(error.statusCode || 400);
        throw error;
      }
    }

    if (status === "refunded" && order.inventoryStatus === "decreased") {
      try {
        await restoreOrderInventory({
          order,
          performedBy: req.user._id,
        });
      } catch (error) {
        res.status(error.statusCode || 400);
        throw error;
      }
    }

    await order.save();

    let payment = null;

    if (transactionId) {
      payment = await Payment.findOne({
        transactionId,
        order: order._id,
      });
    }

    if (!payment) {
      payment = await Payment.findOne({
        order: order._id,
      }).sort({
        createdAt: -1,
      });
    }

    if (payment) {
      payment.status = status;

      payment.providerReference =
        typeof providerReference === "string" ? providerReference.trim() : "";

      payment.failureReason =
        status === "failed" ? String(failureReason || "").trim() : "";

      payment.verifiedAt = new Date();

      if (status === "paid") {
        payment.paidAt = new Date();
      }

      await payment.save();
    }

    return res.status(200).json({
      success: true,
      message: `Payment status updated from ${previousPaymentStatus} to ${status}`,

      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        inventoryStatus: order.inventoryStatus,
      },

      payment,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/admin/orders/:id/tracking
 */
export const updateAdminOrderTracking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      trackingNumber,
      courier = "",
      trackingUrl = "",
      estimatedDeliveryDate = null,
    } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid order ID");
    }

    if (
      !trackingNumber ||
      typeof trackingNumber !== "string" ||
      !trackingNumber.trim()
    ) {
      res.status(400);
      throw new Error("Tracking number is required");
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.orderStatus === "cancelled") {
      res.status(400);

      throw new Error("Cannot add tracking to a cancelled order");
    }

    order.trackingNumber = trackingNumber.trim();

    /*
     * These fields require the Order model additions shown below.
     */
    order.trackingCourier = typeof courier === "string" ? courier.trim() : "";

    order.trackingUrl =
      typeof trackingUrl === "string" ? trackingUrl.trim() : "";

    if (estimatedDeliveryDate) {
      const parsedDate = new Date(estimatedDeliveryDate);

      if (Number.isNaN(parsedDate.getTime())) {
        res.status(400);

        throw new Error("Invalid estimated delivery date");
      }

      order.estimatedDeliveryDate = parsedDate;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order tracking updated successfully",

      tracking: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        courier: order.trackingCourier,
        trackingUrl: order.trackingUrl,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        orderStatus: order.orderStatus,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};
