import "dotenv/config";
console.log("JWT loaded:", Boolean(process.env.JWT_SECRET));
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import homeRoutes from "./routes/home.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import brandRoutes from "./routes/brands.js";
import collectionRoutes from "./routes/collections.js";
import contactRoutes from "./routes/contact.js";
import newsletterRoutes from "./routes/newsletter.js";
import reviewRoutes from "./routes/reviews.js";
import bannerRoutes from "./routes/banners.js";

// Developer 2 routes
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import adminCouponRoutes from "./routes/adminCouponRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import adminShippingRoutes from "./routes/adminShippingRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminCustomerRoutes from "./routes/adminCustomerRoutes.js";
import adminPaymentRoutes from "./routes/adminPaymentRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";

// Error middleware
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// Create Express application
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Basic API route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Aromiq API is running",
  });
});

// Existing Developer 1 routes
app.use("/api/home", homeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/banners", bannerRoutes);

// Developer 2 authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin/coupons", adminCouponRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/checkout", checkoutRoutes);

app.use("/api/admin/shipping-rules", adminShippingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin/inventory", inventoryRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

// Health-check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// Error handlers must stay after all routes
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

/**
 * Connect to MongoDB before starting the server.
 */
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running in ${
          process.env.NODE_ENV || "development"
        } mode on http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
