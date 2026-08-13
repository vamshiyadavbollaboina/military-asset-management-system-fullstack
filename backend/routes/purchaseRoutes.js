import express from "express";
import {
  getPurchases,
  createPurchase,
  getPurchaseById,
} from "../controllers/purchaseController.js";

import { authenticateToken } from "../middlewares/authMiddleware.js";

import { authorizeRoles } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  getPurchases,
);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "LOGISTICS_OFFICER"),
  createPurchase,
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  getPurchaseById,
);

export default router;
