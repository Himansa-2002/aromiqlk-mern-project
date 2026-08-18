import express from "express";

import {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
  updateAdminOrderTracking,
} from "../controllers/adminOrderController.js";

import { protect } from "../middleware/authMiddleware.js";

import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getAdminOrders);

router.get("/:id", getAdminOrderById);

router.patch("/:id/status", updateAdminOrderStatus);

router.patch("/:id/payment-status", updateAdminPaymentStatus);

router.patch("/:id/tracking", updateAdminOrderTracking);

export default router;
