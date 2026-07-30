import mongoose from 'mongoose';

import ShippingRule from '../models/ShippingRule.js';
import { calculateShipping } from '../services/shippingService.js';

// POST /api/shipping/calculate
export const calculateShippingFee = async (
  req,
  res,
  next
) => {
  try {
    const { district, subtotal } = req.body;

    const shipping = await calculateShipping({
      district,
      subtotal,
    });

    return res.status(200).json({
      success: true,
      message: 'Shipping calculated successfully',
      shipping,
      pricing: {
        subtotal: Number(subtotal),
        shippingFee: shipping.shippingFee,
        total: Number(
          (
            Number(subtotal) + shipping.shippingFee
          ).toFixed(2)
        ),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/admin/shipping-rules
export const getShippingRules = async (
  req,
  res,
  next
) => {
  try {
    const {
      status,
      search = '',
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status === 'active') {
      query.isActive = true;
    }

    if (status === 'inactive') {
      query.isActive = false;
    }

    if (search.trim()) {
      query.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: 'i',
          },
        },
        {
          districts: {
            $regex: search.trim(),
            $options: 'i',
          },
        },
      ];
    }

    const numericPage = Math.max(
      Number(page) || 1,
      1
    );

    const numericLimit = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );

    const skip =
      (numericPage - 1) * numericLimit;

    const [rules, total] = await Promise.all([
      ShippingRule.find(query)
        .populate(
          'createdBy',
          'firstName lastName email role'
        )
        .sort({
          priority: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(numericLimit),

      ShippingRule.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: rules.length,
      total,
      page: numericPage,
      pages: Math.ceil(total / numericLimit),
      rules,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/admin/shipping-rules
export const createShippingRule = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      districts = [],
      shippingFee,
      freeShippingThreshold = null,
      minimumOrderAmount = 0,
      maximumOrderAmount = null,
      estimatedDeliveryDays,
      priority = 0,
      isDefault = false,
      isActive = true,
    } = req.body;

    if (
      !name ||
      shippingFee === undefined ||
      !estimatedDeliveryDays?.min ||
      !estimatedDeliveryDays?.max
    ) {
      res.status(400);

      throw new Error(
        'Name, shipping fee and estimated delivery days are required'
      );
    }

    if (!Array.isArray(districts)) {
      res.status(400);
      throw new Error('Districts must be an array');
    }

    if (isDefault === true) {
      await ShippingRule.updateMany(
        { isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const rule = await ShippingRule.create({
      name: name.trim(),

      districts: districts
        .filter(
          (district) =>
            typeof district === 'string' &&
            district.trim()
        )
        .map((district) => district.trim()),

      shippingFee: Number(shippingFee),

      freeShippingThreshold:
        freeShippingThreshold === null ||
        freeShippingThreshold === ''
          ? null
          : Number(freeShippingThreshold),

      minimumOrderAmount: Number(
        minimumOrderAmount
      ),

      maximumOrderAmount:
        maximumOrderAmount === null ||
        maximumOrderAmount === ''
          ? null
          : Number(maximumOrderAmount),

      estimatedDeliveryDays: {
        min: Number(estimatedDeliveryDays.min),
        max: Number(estimatedDeliveryDays.max),
      },

      priority: Number(priority),
      isDefault: Boolean(isDefault),
      isActive: Boolean(isActive),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message:
        'Shipping rule created successfully',
      rule,
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/admin/shipping-rules/:id
export const updateShippingRule = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid shipping rule ID');
    }

    const rule = await ShippingRule.findById(id);

    if (!rule) {
      res.status(404);
      throw new Error('Shipping rule not found');
    }

    if (
      req.body.name !== undefined
    ) {
      rule.name = req.body.name.trim();
    }

    if (
      req.body.districts !== undefined
    ) {
      if (!Array.isArray(req.body.districts)) {
        res.status(400);
        throw new Error('Districts must be an array');
      }

      rule.districts = req.body.districts
        .filter(
          (district) =>
            typeof district === 'string' &&
            district.trim()
        )
        .map((district) => district.trim());
    }

    if (
      req.body.shippingFee !== undefined
    ) {
      rule.shippingFee = Number(
        req.body.shippingFee
      );
    }

    if (
      req.body.freeShippingThreshold !== undefined
    ) {
      rule.freeShippingThreshold =
        req.body.freeShippingThreshold === null ||
        req.body.freeShippingThreshold === ''
          ? null
          : Number(
              req.body.freeShippingThreshold
            );
    }

    if (
      req.body.minimumOrderAmount !== undefined
    ) {
      rule.minimumOrderAmount = Number(
        req.body.minimumOrderAmount
      );
    }

    if (
      req.body.maximumOrderAmount !== undefined
    ) {
      rule.maximumOrderAmount =
        req.body.maximumOrderAmount === null ||
        req.body.maximumOrderAmount === ''
          ? null
          : Number(
              req.body.maximumOrderAmount
            );
    }

    if (
      req.body.estimatedDeliveryDays !== undefined
    ) {
      rule.estimatedDeliveryDays = {
        min: Number(
          req.body.estimatedDeliveryDays.min
        ),
        max: Number(
          req.body.estimatedDeliveryDays.max
        ),
      };
    }

    if (req.body.priority !== undefined) {
      rule.priority = Number(
        req.body.priority
      );
    }

    if (req.body.isDefault !== undefined) {
      if (req.body.isDefault === true) {
        await ShippingRule.updateMany(
          {
            isDefault: true,
            _id: { $ne: rule._id },
          },
          {
            $set: {
              isDefault: false,
            },
          }
        );
      }

      rule.isDefault = Boolean(
        req.body.isDefault
      );
    }

    if (req.body.isActive !== undefined) {
      rule.isActive = Boolean(
        req.body.isActive
      );
    }

    await rule.save();

    return res.status(200).json({
      success: true,
      message:
        'Shipping rule updated successfully',
      rule,
    });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/admin/shipping-rules/:id
export const deleteShippingRule = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error('Invalid shipping rule ID');
    }

    const rule = await ShippingRule.findById(id);

    if (!rule) {
      res.status(404);
      throw new Error('Shipping rule not found');
    }

    await rule.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        'Shipping rule deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};