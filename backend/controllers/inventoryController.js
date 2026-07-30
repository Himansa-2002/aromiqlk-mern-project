import mongoose from "mongoose";

import Order from "../models/Order.js";
import InventoryMovement from "../models/InventoryMovement.js";

import {
  decreaseOrderInventory,
  restoreOrderInventory,
} from "../services/inventoryService.js";

// GET /api/admin/inventory
export const getInventoryMovements = async (req, res, next) => {
  try {
    const {
      movementType,
      productId,
      orderNumber,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (movementType) {
      query.movementType = movementType;
    }

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        res.status(400);
        throw new Error("Invalid product ID");
      }

      query.product = productId;
    }

    if (orderNumber) {
      query.orderNumber = {
        $regex: orderNumber.trim(),
        $options: "i",
      };
    }

    const numericPage = Math.max(Number(page) || 1, 1);

    const numericLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (numericPage - 1) * numericLimit;

    const [movements, total] = await Promise.all([
      InventoryMovement.find(query)
        .populate("product", "name slug images stock sizes")
        .populate("performedBy", "firstName lastName email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(numericLimit),

      InventoryMovement.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: movements.length,
      total,
      page: numericPage,
      pages: Math.ceil(total / numericLimit),
      movements,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/admin/inventory/product/:productId
export const getProductInventoryHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error("Invalid product ID");
    }

    const movements = await InventoryMovement.find({
      product: productId,
    })
      .populate("product", "name slug images stock sizes")
      .populate("performedBy", "firstName lastName email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: movements.length,
      movements,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/admin/inventory/orders/:orderId/decrease
export const decreaseInventoryForOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400);
      throw new Error("Invalid order ID");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.orderStatus === "cancelled") {
      res.status(400);
      throw new Error("Cannot decrease inventory for a cancelled order");
    }

    try {
      await decreaseOrderInventory({
        order,
        performedBy: req.user._id,
      });
    } catch (error) {
      res.status(error.statusCode || 400);
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Order inventory decreased successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        inventoryStatus: order.inventoryStatus,
        inventoryUpdatedAt: order.inventoryUpdatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/admin/inventory/orders/:orderId/restore
export const restoreInventoryForOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400);
      throw new Error("Invalid order ID");
    }

    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    try {
      await restoreOrderInventory({
        order,
        performedBy: req.user._id,
      });
    } catch (error) {
      res.status(error.statusCode || 400);
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Order inventory restored successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        inventoryStatus: order.inventoryStatus,
        inventoryUpdatedAt: order.inventoryUpdatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};
