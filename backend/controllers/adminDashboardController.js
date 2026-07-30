import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";

const getStartOfToday = () => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
};

const getEndOfToday = () => {
  const date = new Date();

  date.setHours(23, 59, 59, 999);

  return date;
};

const parseDateRange = ({ period, startDate, endDate }) => {
  const now = new Date();

  let start;
  let end = now;

  if (startDate || endDate) {
    if (!startDate || !endDate) {
      const error = new Error("Both startDate and endDate are required");

      error.statusCode = 400;
      throw error;
    }

    start = new Date(startDate);
    end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      const error = new Error("Invalid date range");

      error.statusCode = 400;
      throw error;
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      const error = new Error("startDate cannot be after endDate");

      error.statusCode = 400;
      throw error;
    }

    return {
      start,
      end,
    };
  }

  const periodDays = {
    "7days": 7,
    "30days": 30,
    "90days": 90,
    "1year": 365,
  };

  const days = periodDays[period || "30days"];

  if (!days) {
    const error = new Error("Period must be 7days, 30days, 90days or 1year");

    error.statusCode = 400;
    throw error;
  }

  start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return {
    start,
    end,
  };
};

// GET /api/admin/dashboard/summary
export const getDashboardSummary = async (req, res, next) => {
  try {
    const todayStart = getStartOfToday();
    const todayEnd = getEndOfToday();

    const [
      totalCustomers,
      activeCustomers,
      totalOrders,
      pendingOrders,
      paidPayments,
      todayOrders,
      revenueResult,
      todayRevenueResult,
    ] = await Promise.all([
      User.countDocuments({
        role: "customer",
      }),

      User.countDocuments({
        role: "customer",
        isActive: true,
      }),

      Order.countDocuments(),

      Order.countDocuments({
        orderStatus: "pending",
      }),

      Payment.countDocuments({
        status: "paid",
      }),

      Order.countDocuments({
        createdAt: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      }),

      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            orderStatus: {
              $ne: "cancelled",
            },
          },
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: "$pricing.grandTotal",
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            orderStatus: {
              $ne: "cancelled",
            },
            createdAt: {
              $gte: todayStart,
              $lte: todayEnd,
            },
          },
        },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: "$pricing.grandTotal",
            },
          },
        },
      ]),
    ]);

    const products = await Product.find({})
      .select("name slug images stock sizes lowStockThreshold")
      .lean();

    let lowStockCount = 0;

    for (const product of products) {
      const threshold = Number(product.lowStockThreshold) || 5;

      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        lowStockCount += product.sizes.filter(
          (size) => Number(size.stock || 0) <= threshold,
        ).length;
      } else if (Number(product.stock || 0) <= threshold) {
        lowStockCount += 1;
      }
    }

    return res.status(200).json({
      success: true,
      summary: {
        totalRevenue: Number((revenueResult[0]?.revenue || 0).toFixed(2)),

        todayRevenue: Number((todayRevenueResult[0]?.revenue || 0).toFixed(2)),

        totalOrders,
        todayOrders,
        pendingOrders,
        totalCustomers,
        activeCustomers,
        paidPayments,
        lowStockCount,
        currency: "LKR",
      },
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/admin/dashboard/sales
export const getDashboardSales = async (req, res, next) => {
  try {
    const { period, startDate, endDate } = req.query;

    const range = parseDateRange({
      period,
      startDate,
      endDate,
    });

    const match = {
      paymentStatus: "paid",
      orderStatus: {
        $ne: "cancelled",
      },
      createdAt: {
        $gte: range.start,
        $lte: range.end,
      },
    };

    const [dailySales, totals, topProducts] = await Promise.all([
      Order.aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            revenue: {
              $sum: "$pricing.grandTotal",
            },
            orderCount: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            revenue: {
              $round: ["$revenue", 2],
            },
            orderCount: 1,
          },
        },
      ]),

      Order.aggregate([
        {
          $match: match,
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$pricing.grandTotal",
            },
            totalOrders: {
              $sum: 1,
            },
            averageOrderValue: {
              $avg: "$pricing.grandTotal",
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: match,
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: {
              product: "$items.product",
              name: "$items.name",
              selectedSize: "$items.selectedSize",
            },
            quantitySold: {
              $sum: "$items.quantity",
            },
            revenue: {
              $sum: "$items.itemTotal",
            },
          },
        },
        {
          $sort: {
            quantitySold: -1,
          },
        },
        {
          $limit: 10,
        },
        {
          $project: {
            _id: 0,
            productId: "$_id.product",
            name: "$_id.name",
            selectedSize: "$_id.selectedSize",
            quantitySold: 1,
            revenue: {
              $round: ["$revenue", 2],
            },
          },
        },
      ]),
    ]);

    const salesTotals = totals[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
    };

    return res.status(200).json({
      success: true,
      range: {
        startDate: range.start,
        endDate: range.end,
      },
      totals: {
        totalRevenue: Number((salesTotals.totalRevenue || 0).toFixed(2)),
        totalOrders: salesTotals.totalOrders || 0,
        averageOrderValue: Number(
          (salesTotals.averageOrderValue || 0).toFixed(2),
        ),
        currency: "LKR",
      },
      dailySales,
      topProducts,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/admin/dashboard/low-stock
export const getDashboardLowStock = async (req, res, next) => {
  try {
    const requestedThreshold =
      req.query.threshold !== undefined ? Number(req.query.threshold) : null;

    if (
      requestedThreshold !== null &&
      (Number.isNaN(requestedThreshold) || requestedThreshold < 0)
    ) {
      res.status(400);
      throw new Error("Threshold must be a positive number or zero");
    }

    const products = await Product.find({})
      .select("name slug images stock sizes lowStockThreshold brand category")
      .populate("brand", "name slug")
      .populate("category", "name slug")
      .sort({
        name: 1,
      })
      .lean();

    const lowStockItems = [];

    for (const product of products) {
      const threshold =
        requestedThreshold ?? Number(product.lowStockThreshold) ?? 5;

      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        for (const size of product.sizes) {
          const currentStock = Number(size.stock || 0);

          if (currentStock <= threshold) {
            lowStockItems.push({
              productId: product._id,
              name: product.name,
              slug: product.slug,
              image: product.images?.[0] || "",
              brand: product.brand,
              category: product.category,
              selectedSize: size.label,
              currentStock,
              threshold,
              outOfStock: currentStock === 0,
            });
          }
        }
      } else {
        const currentStock = Number(product.stock || 0);

        if (currentStock <= threshold) {
          lowStockItems.push({
            productId: product._id,
            name: product.name,
            slug: product.slug,
            image: product.images?.[0] || "",
            brand: product.brand,
            category: product.category,
            selectedSize: "",
            currentStock,
            threshold,
            outOfStock: currentStock === 0,
          });
        }
      }
    }

    lowStockItems.sort(
      (first, second) => first.currentStock - second.currentStock,
    );

    return res.status(200).json({
      success: true,
      count: lowStockItems.length,
      items: lowStockItems,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/admin/dashboard/recent-orders
export const getDashboardRecentOrders = async (req, res, next) => {
  try {
    const numericLimit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50,
    );

    const orders = await Order.find({})
      .select(
        "orderNumber customer items pricing paymentMethod paymentStatus orderStatus inventoryStatus trackingNumber placedAt createdAt",
      )
      .sort({
        createdAt: -1,
      })
      .limit(numericLimit);

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return next(error);
  }
};
