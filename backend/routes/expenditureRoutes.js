import express from "express";

import {
  createExpenditure,
  getExpenditures,
  getExpenditureById,
} from "../controllers/expenditureController.js";

import { authenticateToken } from "../middlewares/authMiddleware.js";

import { authorizeRoles } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "LOGISTICS_OFFICER"),
  createExpenditure,
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  getExpenditures,
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  getExpenditureById,
);

export default router;
