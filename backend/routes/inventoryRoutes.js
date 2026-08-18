import express from "express";

import {
  getInventoryMovements,
  getProductInventoryHistory,
  decreaseInventoryForOrder,
  restoreInventoryForOrder,
} from "../controllers/inventoryController.js";

import { protect } from "../middleware/authMiddleware.js";

import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getInventoryMovements);

router.get("/product/:productId", getProductInventoryHistory);

router.post("/orders/:orderId/decrease", decreaseInventoryForOrder);

router.post("/orders/:orderId/restore", restoreInventoryForOrder);

export default router;
