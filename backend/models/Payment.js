import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    orderNumber: {
      type: String,
      required: true,
      index: true,
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    providerReference: {
      type: String,
      default: "",
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "card", "bank_transfer"],
      required: true,
    },

    provider: {
      type: String,
      enum: ["cash_on_delivery", "manual", "payhere", "stripe", "other"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "LKR",
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "paid",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },

    failureReason: {
      type: String,
      default: "",
      trim: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    paidAt: {
      type: Date,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({
  order: 1,
  user: 1,
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
