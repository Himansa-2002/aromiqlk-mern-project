import mongoose from "mongoose";

import Payment from "../models/Payment.js";

const PAYMENT_STATUSES = [
  "pending",
  "processing",
  "paid",
  "failed",
  "cancelled",
  "refunded",
];

const PAYMENT_METHODS = ["cash_on_delivery", "card", "bank_transfer"];

const PAYMENT_PROVIDERS = [
  "cash_on_delivery",
  "manual",
  "payhere",
  "stripe",
  "other",
];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/admin/payments
export const getAdminPayments = async (req, res, next) => {
  try {
    const {
      search = "",
      status,
      paymentMethod,
      provider,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sort = "newest",
    } = req.query;

    const query = {};

    if (status) {
      if (!PAYMENT_STATUSES.includes(status)) {
        res.status(400);
        throw new Error("Invalid payment status");
      }

      query.status = status;
    }

    if (paymentMethod) {
      if (!PAYMENT_METHODS.includes(paymentMethod)) {
        res.status(400);
        throw new Error("Invalid payment method");
      }

      query.paymentMethod = paymentMethod;
    }

    if (provider) {
      if (!PAYMENT_PROVIDERS.includes(provider)) {
        res.status(400);
        throw new Error("Invalid payment provider");
      }

      query.provider = provider;
    }

    if (search.trim()) {
      const searchValue = search.trim();

      query.$or = [
        {
          transactionId: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          orderNumber: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          providerReference: {
            $regex: searchValue,
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
      highest: { amount: -1 },
      lowest: { amount: 1 },
    };

    const selectedSort = sortOptions[sort] || sortOptions.newest;

    const [payments, total, summary] = await Promise.all([
      Payment.find(query)
        .populate("user", "firstName lastName email phone role isActive")
        .populate(
          "order",
          "orderNumber pricing paymentStatus orderStatus createdAt",
        )
        .sort(selectedSort)
        .skip(skip)
        .limit(numericLimit),

      Payment.countDocuments(query),

      Payment.aggregate([
        {
          $match: query,
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: "$amount",
            },
            paidAmount: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "paid"],
                  },
                  "$amount",
                  0,
                ],
              },
            },
            pendingAmount: {
              $sum: {
                $cond: [
                  {
                    $in: ["$status", ["pending", "processing"]],
                  },
                  "$amount",
                  0,
                ],
              },
            },
            refundedAmount: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$status", "refunded"],
                  },
                  "$amount",
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const paymentSummary = summary[0] || {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      refundedAmount: 0,
    };

    return res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page: numericPage,
      pages: Math.ceil(total / numericLimit),

      summary: {
        totalAmount: Number(paymentSummary.totalAmount.toFixed(2)),
        paidAmount: Number(paymentSummary.paidAmount.toFixed(2)),
        pendingAmount: Number(paymentSummary.pendingAmount.toFixed(2)),
        refundedAmount: Number(paymentSummary.refundedAmount.toFixed(2)),
        currency: "LKR",
      },

      payments,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/admin/payments/:id
export const getAdminPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid payment ID");
    }

    const payment = await Payment.findById(id)
      .populate(
        "user",
        "firstName lastName email phone role isActive addresses createdAt",
      )
      .populate({
        path: "order",
        select:
          "orderNumber customer deliveryAddress items coupon shipping pricing paymentMethod paymentStatus orderStatus inventoryStatus trackingNumber trackingCourier trackingUrl estimatedDeliveryDate placedAt createdAt updatedAt",
        populate: {
          path: "items.product",
          select: "name slug images brand category gender stock sizes",
        },
      });

    if (!payment) {
      res.status(404);
      throw new Error("Payment not found");
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    return next(error);
  }
};
