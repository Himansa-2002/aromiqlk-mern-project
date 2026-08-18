import express from "express";

import {
  createPayment,
  verifyPayment,
  paymentWebhook,
  getPaymentByOrder,
} from "../controllers/paymentController.js";

import {
  createOnePayTransaction,
  verifyOnePayTransaction,
  onePayWebhook,
} from "../controllers/onepayController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/webhook/:provider", paymentWebhook);
router.post("/onepay/callback", onePayWebhook);

router.use(protect);

router.post("/create", createPayment);
router.post("/verify", verifyPayment);

router.post("/onepay/create", createOnePayTransaction);
router.post("/onepay/verify", verifyOnePayTransaction);

router.get("/:orderId", getPaymentByOrder);

export default router;
