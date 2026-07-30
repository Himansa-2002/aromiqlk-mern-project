import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Coupon code must contain at least 3 characters'],
      maxlength: [30, 'Coupon code cannot exceed 30 characters'],
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Discount type is required'],
    },

    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative'],
    },

    maximumDiscountAmount: {
      type: Number,
      default: null,
      min: [0, 'Maximum discount cannot be negative'],
    },

    usageLimit: {
      type: Number,
      default: null,
      min: [1, 'Usage limit must be at least 1'],
    },

    usageLimitPerUser: {
      type: Number,
      default: 1,
      min: [1, 'Per-user usage limit must be at least 1'],
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    startsAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: [true, 'Coupon expiry date is required'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.pre('validate', function (next) {
  if (
    this.discountType === 'percentage' &&
    this.discountValue > 100
  ) {
    return next(
      new Error('Percentage discount cannot exceed 100')
    );
  }

  if (
    this.startsAt &&
    this.expiresAt &&
    this.expiresAt <= this.startsAt
  ) {
    return next(
      new Error('Expiry date must be after start date')
    );
  }

  return next();
});

export default mongoose.model('Coupon', couponSchema);