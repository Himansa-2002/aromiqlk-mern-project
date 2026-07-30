import express from "express";

import {
  getAdminPayments,
  getAdminPaymentById,
} from "../controllers/adminPaymentController.js";

import { protect } from "../middleware/authMiddleware.js";

import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getAdminPayments);

router.get("/:id", getAdminPaymentById);

export default router;
