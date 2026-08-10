import mongoose from "mongoose";

import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

import {
  resolvePaymentProvider,
  createPaymentReference,
  getInitialPaymentStatus,
  buildPaymentInstructions,
} from "../services/paymentService.js";
import {
  decreaseOrderInventory,
  restoreOrderInventory,
} from "../services/inventoryService.js";
import crypto from "crypto";

const allowedVerificationStatuses = ["paid", "failed", "cancelled"];

const updateOrderPaymentStatus = async (order, paymentStatus) => {
  if (paymentStatus === "paid") {
    order.paymentStatus = "paid";

    if (order.orderStatus === "pending") {
      order.orderStatus = "confirmed";
    }
  }

  if (paymentStatus === "failed") {
    order.paymentStatus = "failed";
  }

  if (paymentStatus === "cancelled") {
    order.paymentStatus = "failed";
  }

  if (paymentStatus === "refunded") {
    order.paymentStatus = "refunded";
  }

  await order.save();
};

// POST /api/payments/create
export const createPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400);
      throw new Error("Order ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400);
      throw new Error("Invalid order ID");
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.orderStatus === "cancelled") {
      res.status(400);
      throw new Error("Cannot create payment for a cancelled order");
    }

    if (order.paymentStatus === "paid") {
      res.status(409);
      throw new Error("This order has already been paid");
    }

    let payment = await Payment.findOne({
      order: order._id,
      status: {
        $in: ["pending", "processing", "paid"],
      },
    });

    if (payment) {
      return res.status(200).json({
        success: true,
        message: "An active payment already exists for this order",
        payment,
        instructions: buildPaymentInstructions({
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: payment.currency,
        }),
      });
    }

    const provider = resolvePaymentProvider(order.paymentMethod);

    const transactionId = createPaymentReference();

    const initialStatus = getInitialPaymentStatus(order.paymentMethod);

    payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      orderNumber: order.orderNumber,
      transactionId,
      paymentMethod: order.paymentMethod,
      provider,
      amount: order.pricing.grandTotal,
      currency: order.pricing.currency || "LKR",
      status: initialStatus,
    });

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment,
      instructions: buildPaymentInstructions({
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        amount: payment.amount,
        currency: payment.currency,
      }),
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/payments/verify
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      transactionId,
      status,
      providerReference = "",
      failureReason = "",
    } = req.body;

    if (!transactionId || !status) {
      res.status(400);

      throw new Error("Transaction ID and payment status are required");
    }

    if (!allowedVerificationStatuses.includes(status)) {
      res.status(400);

      throw new Error("Status must be paid, failed, or cancelled");
    }

    const payment = await Payment.findOne({
      transactionId,
      user: req.user._id,
    });

    if (!payment) {
      res.status(404);
      throw new Error("Payment not found");
    }

    if (payment.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment has already been verified",
        payment,
      });
    }

    const order = await Order.findOne({
      _id: payment.order,
      user: req.user._id,
    });

    if (!order) {
      res.status(404);
      throw new Error("Related order not found");
    }

    /*
     * Development/manual verification.
     * Do not allow customers to mark real card payments
     * as paid in production.
     */
    payment.status = status;
    payment.providerReference =
      typeof providerReference === "string" ? providerReference.trim() : "";

    payment.failureReason =
      status === "failed" || status === "cancelled"
        ? String(failureReason || "").trim()
        : "";

    payment.verifiedAt = new Date();

    if (status === "paid") {
      payment.paidAt = new Date();
    }

    await payment.save();

    await updateOrderPaymentStatus(order, status);

    if (status === "paid" && order.inventoryStatus === "pending") {
      await decreaseOrderInventory({
        order,
        performedBy: req.user._id,
      });
    }

    if (status === "cancelled" && order.inventoryStatus === "decreased") {
      await restoreOrderInventory({
        order,
        performedBy: req.user._id,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/payments/webhook/:provider
export const paymentWebhook = async (req, res, next) => {
  try {
    const { provider } = req.params;

    // --- PAYHERE SPECIFIC LOGIC ---
    if (provider === "payhere") {
      const {
        merchant_id,
        order_id,
        payment_id,
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig,
      } = req.body;

      // Verify Cryptographic Hash from PayHere Server
      const merchantSecret = process.env.PAYHERE_SECRET || "xyz_sandbox_secret";
      const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
      const verificationString = merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret;
      const localMd5sig = crypto.createHash('md5').update(verificationString).digest('hex').toUpperCase();

      if (localMd5sig !== md5sig) {
        res.status(401);
        throw new Error("Invalid cryptographic signature in PayHere webhook. Tampering detected.");
      }

      const order = await Order.findOne({ orderNumber: order_id });
      if (!order) {
        res.status(404);
        throw new Error("Order matched with PayHere Webhook not found");
      }

      let normalizedStatus = "pending";
      if (status_code == 2) normalizedStatus = "paid";
      else if (status_code == -1 || status_code == -2) normalizedStatus = "failed";
      else if (status_code == -3) normalizedStatus = "cancelled";

      await updateOrderPaymentStatus(order, normalizedStatus);

      // Decrement logic if strictly paid
      if (normalizedStatus === 'paid' && order.inventoryStatus === 'pending') {
        await decreaseOrderInventory({ order, performedBy: null });
      }

      if (['cancelled', 'failed'].includes(normalizedStatus) && order.inventoryStatus === 'decreased') {
        await restoreOrderInventory({ order, performedBy: null });
      }

      return res.status(200).send("Webhook Received & Verified");
    }
    // --- END PAYHERE SPECIFIC LOGIC ---

    const {
      transactionId,
      providerReference = "",
      status,
      signature,
    } = req.body;

    if (!transactionId || !status) {
      res.status(400);

      throw new Error("Transaction ID and status are required");
    }

    /*
     * A real gateway integration must verify the webhook
     * signature before updating payment data.
     */
    if (process.env.NODE_ENV === "production" && !signature) {
      res.status(401);

      throw new Error("Webhook signature is required");
    }

    const payment = await Payment.findOne({
      transactionId,
      provider,
    });

    if (!payment) {
      res.status(404);
      throw new Error("Payment not found");
    }

    const webhookStatusMap = {
      success: "paid",
      paid: "paid",
      completed: "paid",
      failed: "failed",
      cancelled: "cancelled",
      canceled: "cancelled",
      refunded: "refunded",
      pending: "pending",
      processing: "processing",
    };

    const normalizedStatus = webhookStatusMap[String(status).toLowerCase()];

    if (!normalizedStatus) {
      res.status(400);
      throw new Error("Unsupported webhook payment status");
    }

    payment.status = normalizedStatus;
    payment.providerReference = String(providerReference || "").trim();

    payment.metadata = {
      ...payment.metadata,
      webhookPayload: req.body,
    };

    payment.verifiedAt = new Date();

    if (normalizedStatus === "paid") {
      payment.paidAt = new Date();
    }

    await payment.save();

    const order = await Order.findById(payment.order);

    if (order) {
      await updateOrderPaymentStatus(order, normalizedStatus);
    }

    if (
      normalizedStatus === 'paid' &&
      order.inventoryStatus === 'pending'
    ) {
      await decreaseOrderInventory({
        order,
        performedBy: null,
      });
    }

    if (
      ['cancelled', 'refunded'].includes(
        normalizedStatus
      ) &&
      order.inventoryStatus === 'decreased'
    ) {
      await restoreOrderInventory({
        order,
        performedBy: null,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Payment webhook processed successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/payments/:orderId
export const getPaymentByOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400);
      throw new Error("Invalid order ID");
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const payments = await Payment.find({
      order: order._id,
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        grandTotal: order.pricing.grandTotal,
        currency: order.pricing.currency,
      },
      count: payments.length,
      payments,
    });
  } catch (error) {
    return next(error);
  }
};
