import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderByNumber,
  trackOrder,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createOrder);

router.get("/me", getMyOrders);

router.get("/:orderNumber/tracking", trackOrder);

router.get("/:orderNumber", getOrderByNumber);

export default router;
