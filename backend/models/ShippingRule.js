import mongoose from "mongoose";

const shippingRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Shipping rule name is required"],
      trim: true,
      maxlength: [100, "Rule name cannot exceed 100 characters"],
    },

    districts: {
      type: [String],
      default: [],
    },

    shippingFee: {
      type: Number,
      required: [true, "Shipping fee is required"],
      min: [0, "Shipping fee cannot be negative"],
    },

    freeShippingThreshold: {
      type: Number,
      default: null,
      min: [0, "Free shipping threshold cannot be negative"],
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },

    maximumOrderAmount: {
      type: Number,
      default: null,
      min: [0, "Maximum order amount cannot be negative"],
    },

    estimatedDeliveryDays: {
      min: {
        type: Number,
        required: true,
        min: [1, "Minimum delivery days must be at least 1"],
      },

      max: {
        type: Number,
        required: true,
        min: [1, "Maximum delivery days must be at least 1"],
      },
    },

    priority: {
      type: Number,
      default: 0,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

shippingRuleSchema.pre("validate", function validateRule(next) {
  if (
    this.maximumOrderAmount !== null &&
    this.maximumOrderAmount < this.minimumOrderAmount
  ) {
    return next(
      new Error(
        "Maximum order amount must be greater than minimum order amount",
      ),
    );
  }

  if (
    this.estimatedDeliveryDays &&
    this.estimatedDeliveryDays.max < this.estimatedDeliveryDays.min
  ) {
    return next(
      new Error(
        "Maximum delivery days must be greater than or equal to minimum delivery days",
      ),
    );
  }

  return next();
});

const ShippingRule = mongoose.model("ShippingRule", shippingRuleSchema);

export default ShippingRule;
