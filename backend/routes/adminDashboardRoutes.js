import express from "express";

import {
  getDashboardSummary,
  getDashboardSales,
  getDashboardLowStock,
  getDashboardRecentOrders,
} from "../controllers/adminDashboardController.js";

import { protect } from "../middleware/authMiddleware.js";

import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/summary", getDashboardSummary);

router.get("/sales", getDashboardSales);

router.get("/low-stock", getDashboardLowStock);

router.get("/recent-orders", getDashboardRecentOrders);

export default router;
