import express from "express";
import {
  createTransfer,
  getTransfers,
  getTransferById,
} from "../controllers/transferController.js";

import { authenticateToken } from "../middlewares/authMiddleware.js";

import { authorizeRoles } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "LOGISTICS_OFFICER"),
  createTransfer,
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  getTransfers,
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  getTransferById,
);

export default router;
