import express from "express";

import {
  getDashboardMetrics,
} from "../controllers/dashboardController.js";

import {
  authenticateToken,
} from "../middlewares/authMiddleware.js";

import {
  enforceBaseScope,
} from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.get(
  "/metrics",
  authenticateToken,
  enforceBaseScope,
  getDashboardMetrics
);

export default router;