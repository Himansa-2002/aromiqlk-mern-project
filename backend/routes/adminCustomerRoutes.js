import express from "express";

import {
  getAdminCustomers,
  getAdminCustomerById,
  updateAdminCustomerStatus,
  updateAdminCustomerRole,
} from "../controllers/adminCustomerController.js";

import { protect } from "../middleware/authMiddleware.js";

import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getAdminCustomers);

router.get("/:id", getAdminCustomerById);

router.patch("/:id/status", updateAdminCustomerStatus);

router.patch("/:id/role", updateAdminCustomerRole);

export default router;
