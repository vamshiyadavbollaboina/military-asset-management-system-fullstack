import express from "express";
import { login } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);

router.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default router;
