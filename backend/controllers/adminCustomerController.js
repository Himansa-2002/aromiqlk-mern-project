import mongoose from "mongoose";

import User from "../models/User.js";
import Order from "../models/Order.js";

const ALLOWED_ROLES = ["customer", "admin"];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/admin/customers
export const getAdminCustomers = async (req, res, next) => {
  try {
    const {
      search = "",
      role,
      status,
      page = 1,
      limit = 20,
      sort = "newest",
    } = req.query;

    const query = {};

    if (role) {
      if (!ALLOWED_ROLES.includes(role)) {
        res.status(400);
        throw new Error("Invalid customer role");
      }

      query.role = role;
    }

    if (status) {
      if (!["active", "inactive"].includes(status)) {
        res.status(400);
        throw new Error("Status must be active or inactive");
      }

      query.isActive = status === "active";
    }

    if (search.trim()) {
      const searchValue = search.trim();

      query.$or = [
        {
          firstName: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          lastName: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          email: {
            $regex: searchValue,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: searchValue,
            $options: "i",
          },
        },
      ];
    }

    const numericPage = Math.max(Number(page) || 1, 1);

    const numericLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const skip = (numericPage - 1) * numericLimit;

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name: { firstName: 1, lastName: 1 },
    };

    const selectedSort = sortOptions[sort] || sortOptions.newest;

    const [customers, total] = await Promise.all([
      User.find(query)
        .select(
          "firstName lastName email phone role isActive addresses createdAt updatedAt",
        )
        .sort(selectedSort)
        .skip(skip)
        .limit(numericLimit)
        .lean(),

      User.countDocuments(query),
    ]);

    const customerIds = customers.map((customer) => customer._id);

    const orderStatistics = await Order.aggregate([
      {
        $match: {
          user: {
            $in: customerIds,
          },
        },
      },
      {
        $group: {
          _id: "$user",
          orderCount: {
            $sum: 1,
          },
          totalSpent: {
            $sum: {
              $cond: [
                {
                  $eq: ["$paymentStatus", "paid"],
                },
                "$pricing.grandTotal",
                0,
              ],
            },
          },
        },
      },
    ]);

    const statisticsMap = new Map(
      orderStatistics.map((item) => [String(item._id), item]),
    );

    const formattedCustomers = customers.map((customer) => {
      const statistics = statisticsMap.get(String(customer._id));

      return {
        ...customer,
        orderCount: statistics?.orderCount || 0,
        totalSpent: Number((statistics?.totalSpent || 0).toFixed(2)),
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedCustomers.length,
      total,
      page: numericPage,
      pages: Math.ceil(total / numericLimit),
      customers: formattedCustomers,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/admin/customers/:id
export const getAdminCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid customer ID");
    }

    const customer = await User.findById(id).select(
      "-password -resetPasswordToken -resetPasswordExpire",
    );

    if (!customer) {
      res.status(404);
      throw new Error("Customer not found");
    }

    const [orderSummary, recentOrders] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            user: customer._id,
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: {
              $sum: 1,
            },
            totalSpent: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$paymentStatus", "paid"],
                  },
                  "$pricing.grandTotal",
                  0,
                ],
              },
            },
            pendingOrders: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$orderStatus", "pending"],
                  },
                  1,
                  0,
                ],
              },
            },
            deliveredOrders: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$orderStatus", "delivered"],
                  },
                  1,
                  0,
                ],
              },
            },
            cancelledOrders: {
              $sum: {
                $cond: [
                  {
                    $eq: ["$orderStatus", "cancelled"],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      Order.find({
        user: customer._id,
      })
        .select(
          "orderNumber pricing paymentMethod paymentStatus orderStatus placedAt createdAt",
        )
        .sort({
          createdAt: -1,
        })
        .limit(10),
    ]);

    const statistics = orderSummary[0] || {
      totalOrders: 0,
      totalSpent: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
    };

    return res.status(200).json({
      success: true,
      customer,
      statistics: {
        ...statistics,
        totalSpent: Number((statistics.totalSpent || 0).toFixed(2)),
      },
      recentOrders,
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/admin/customers/:id/status
export const updateAdminCustomerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid customer ID");
    }

    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error("isActive must be true or false");
    }

    if (String(req.user._id) === String(id)) {
      res.status(400);
      throw new Error("You cannot change your own account status");
    }

    const customer = await User.findById(id);

    if (!customer) {
      res.status(404);
      throw new Error("Customer not found");
    }

    customer.isActive = isActive;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Customer account activated successfully"
        : "Customer account deactivated successfully",
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        role: customer.role,
        isActive: customer.isActive,
        updatedAt: customer.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/admin/customers/:id/role
export const updateAdminCustomerRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400);
      throw new Error("Invalid customer ID");
    }

    if (!role || !ALLOWED_ROLES.includes(role)) {
      res.status(400);
      throw new Error("Role must be customer or admin");
    }

    if (String(req.user._id) === String(id)) {
      res.status(400);
      throw new Error("You cannot change your own account role");
    }

    const customer = await User.findById(id);

    if (!customer) {
      res.status(404);
      throw new Error("Customer not found");
    }

    if (customer.role === role) {
      return res.status(200).json({
        success: true,
        message: `Customer already has the ${role} role`,
        customer: {
          id: customer._id,
          email: customer.email,
          role: customer.role,
        },
      });
    }

    customer.role = role;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: `Customer role updated to ${role}`,
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        role: customer.role,
        isActive: customer.isActive,
        updatedAt: customer.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};
