import express from "express";

import { getCheckoutSummary } from "../controllers/checkoutController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/summary", getCheckoutSummary);

export default router;
