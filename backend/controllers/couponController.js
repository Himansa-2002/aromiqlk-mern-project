import mongoose from "mongoose";

import Coupon from "../models/Coupon.js";
import CouponUsage from "../models/CouponUsage.js";

const normalizeCode = (code) =>
  typeof code === "string" ? code.trim().toUpperCase() : "";

const calculateDiscount = (coupon, subtotal) => {
  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    discountAmount = subtotal * (coupon.discountValue / 100);

    if (
      coupon.maximumDiscountAmount !== null &&
      coupon.maximumDiscountAmount !== undefined
    ) {
      discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  discountAmount = Math.min(discountAmount, subtotal);

  return Number(discountAmount.toFixed(2));
};

const validateCouponRules = async (coupon, userId, subtotal) => {
  const now = new Date();

  if (!coupon.isActive) {
    const error = new Error("This coupon is inactive");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.startsAt && now < coupon.startsAt) {
    const error = new Error("This coupon is not active yet");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.expiresAt && now > coupon.expiresAt) {
    const error = new Error("This coupon has expired");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    const error = new Error("This coupon usage limit has been reached");
    error.statusCode = 400;
    throw error;
  }

  if (subtotal < coupon.minimumOrderAmount) {
    const error = new Error(
      `Minimum order amount is ${coupon.minimumOrderAmount}`,
    );
    error.statusCode = 400;
    throw error;
  }

  const userUsageCount = await CouponUsage.countDocuments({
    coupon: coupon._id,
    user: userId,
  });

  if (userUsageCount >= coupon.usageLimitPerUser) {
    const error = new Error(
      "You have already reached the usage limit for this coupon",
    );
    error.statusCode = 400;
    throw error;
  }
};

// POST /api/coupons/validate
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    const normalizedCode = normalizeCode(code);
    const numericSubtotal = Number(subtotal);

    if (!normalizedCode) {
      res.status(400);
      throw new Error("Coupon code is required");
    }

    if (Number.isNaN(numericSubtotal) || numericSubtotal <= 0) {
      res.status(400);
      throw new Error("A valid cart subtotal is required");
    }

    const coupon = await Coupon.findOne({
      code: normalizedCode,
    });

    if (!coupon) {
      res.status(404);
      throw new Error("Invalid coupon code");
    }

    try {
      await validateCouponRules(coupon, req.user._id, numericSubtotal);
    } catch (error) {
      res.status(error.statusCode || 400);
      throw error;
    }

    const discountAmount = calculateDiscount(coupon, numericSubtotal);

    const discountedSubtotal = Number(
      (numericSubtotal - discountAmount).toFixed(2),
    );

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscountAmount: coupon.maximumDiscountAmount,
        expiresAt: coupon.expiresAt,
      },
      pricing: {
        subtotal: numericSubtotal,
        discountAmount,
        discountedSubtotal,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/admin/coupons
export const getAdminCoupons = async (req, res, next) => {
  try {
    const { search = "", status, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search.trim()) {
      query.$or = [
        {
          code: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (status === "active") {
      query.isActive = true;
    }

    if (status === "inactive") {
      query.isActive = false;
    }

    const numericPage = Math.max(Number(page) || 1, 1);

    const numericLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (numericPage - 1) * numericLimit;

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .populate("createdBy", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(numericLimit),

      Coupon.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: coupons.length,
      total,
      page: numericPage,
      pages: Math.ceil(total / numericLimit),
      coupons,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/admin/coupons
export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description = "",
      discountType,
      discountValue,
      minimumOrderAmount = 0,
      maximumDiscountAmount = null,
      usageLimit = null,
      usageLimitPerUser = 1,
      startsAt,
      expiresAt,
      isActive = true,
    } = req.body;

    const normalizedCode = normalizeCode(code);

    if (
      !normalizedCode ||
      !discountType ||
      discountValue === undefined ||
      !expiresAt
    ) {
      res.status(400);
      throw new Error(
        "Code, discount type, discount value and expiry date are required",
      );
    }

    const existingCoupon = await Coupon.findOne({
      code: normalizedCode,
    });

    if (existingCoupon) {
      res.status(409);
      throw new Error("Coupon code already exists");
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minimumOrderAmount: Number(minimumOrderAmount),
      maximumDiscountAmount:
        maximumDiscountAmount === null || maximumDiscountAmount === ""
          ? null
          : Number(maximumDiscountAmount),
      usageLimit:
        usageLimit === null || usageLimit === "" ? null : Number(usageLimit),
      usageLimitPerUser: Number(usageLimitPerUser),
      startsAt: startsAt ? new Date(startsAt) : new Date(),
      expiresAt: new Date(expiresAt),
      isActive: Boolean(isActive),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/admin/coupons/:id
export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid coupon ID");
    }

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      res.status(404);
      throw new Error("Coupon not found");
    }

    const allowedFields = [
      "description",
      "discountType",
      "discountValue",
      "minimumOrderAmount",
      "maximumDiscountAmount",
      "usageLimit",
      "usageLimitPerUser",
      "startsAt",
      "expiresAt",
      "isActive",
    ];

    if (req.body.code !== undefined) {
      const normalizedCode = normalizeCode(req.body.code);

      const duplicateCoupon = await Coupon.findOne({
        code: normalizedCode,
        _id: { $ne: coupon._id },
      });

      if (duplicateCoupon) {
        res.status(409);
        throw new Error("Coupon code already exists");
      }

      coupon.code = normalizedCode;
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        coupon[field] = req.body[field];
      }
    });

    if (req.body.description !== undefined) {
      coupon.description = req.body.description.trim();
    }

    if (req.body.discountValue !== undefined) {
      coupon.discountValue = Number(req.body.discountValue);
    }

    if (req.body.minimumOrderAmount !== undefined) {
      coupon.minimumOrderAmount = Number(req.body.minimumOrderAmount);
    }

    if (req.body.maximumDiscountAmount !== undefined) {
      coupon.maximumDiscountAmount =
        req.body.maximumDiscountAmount === null ||
        req.body.maximumDiscountAmount === ""
          ? null
          : Number(req.body.maximumDiscountAmount);
    }

    if (req.body.usageLimit !== undefined) {
      coupon.usageLimit =
        req.body.usageLimit === null || req.body.usageLimit === ""
          ? null
          : Number(req.body.usageLimit);
    }

    if (req.body.usageLimitPerUser !== undefined) {
      coupon.usageLimitPerUser = Number(req.body.usageLimitPerUser);
    }

    if (req.body.startsAt !== undefined) {
      coupon.startsAt = new Date(req.body.startsAt);
    }

    if (req.body.expiresAt !== undefined) {
      coupon.expiresAt = new Date(req.body.expiresAt);
    }

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/admin/coupons/:id
export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid coupon ID");
    }

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      res.status(404);
      throw new Error("Coupon not found");
    }

    await CouponUsage.deleteMany({
      coupon: coupon._id,
    });

    await coupon.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
