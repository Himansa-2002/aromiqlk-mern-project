import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    label: {
      type: String,
      default: "Home",
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine2: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "Sri Lanka",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    selectedSize: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    itemTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  },
);

const couponSnapshotSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },

    code: {
      type: String,
      default: null,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: null,
    },

    discountValue: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const shippingSnapshotSchema = new mongoose.Schema(
  {
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingRule",
      required: true,
    },

    ruleName: {
      type: String,
      required: true,
    },

    district: {
      type: String,
      required: true,
    },

    shippingFee: {
      type: Number,
      required: true,
      min: 0,
    },

    freeShipping: {
      type: Boolean,
      default: false,
    },

    estimatedDeliveryDays: {
      min: {
        type: Number,
        required: true,
      },

      max: {
        type: Number,
        required: true,
      },
    },
  },
  {
    _id: false,
  },
);

const pricingSchema = new mongoose.Schema(
  {
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountedSubtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "LKR",
      uppercase: true,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    customer: {
      type: customerSchema,
      required: true,
    },

    deliveryAddress: {
      type: deliveryAddressSchema,
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },

    coupon: {
      type: couponSnapshotSchema,
      default: null,
    },

    shipping: {
      type: shippingSnapshotSchema,
      required: true,
    },

    pricing: {
      type: pricingSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "card", "bank_transfer", "onepay"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    onePayTransactionId: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    inventoryStatus: {
      type: String,
      enum: ["pending", "decreased", "restored"],
      default: "pending",
      index: true,
    },

    inventoryUpdatedAt: {
      type: Date,
      default: null,
    },

    customerNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    trackingNumber: {
      type: String,
      default: "",
      trim: true,
    },

    trackingCourier: {
      type: String,
      default: '',
      trim: true,
    },

    trackingUrl: {
      type: String,
      default: '',
      trim: true,
    },

    estimatedDeliveryDate: {
      type: Date,
      default: null,
    },

    placedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({
  user: 1,
  createdAt: -1,
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
