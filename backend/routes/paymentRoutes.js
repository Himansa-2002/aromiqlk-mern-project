import express from "express";

import {
  createPayment,
  verifyPayment,
  paymentWebhook,
  getPaymentByOrder,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/webhook/:provider", paymentWebhook);

router.use(protect);

router.post("/create", createPayment);
router.post("/verify", verifyPayment);

router.get("/:orderId", getPaymentByOrder);

export default router;
