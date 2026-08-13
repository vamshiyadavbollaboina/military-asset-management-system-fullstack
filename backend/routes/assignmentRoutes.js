import express from "express";

import {
  createAssignment,
  getAssignments,
  getAssignmentById,
} from "../controllers/assignmentController.js";

import { authenticateToken } from "../middlewares/authMiddleware.js";

import { authorizeRoles } from "../middlewares/rbacMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "LOGISTICS_OFFICER"),
  createAssignment,
);

router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  getAssignments,
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"),
  getAssignmentById,
);

export default router;
