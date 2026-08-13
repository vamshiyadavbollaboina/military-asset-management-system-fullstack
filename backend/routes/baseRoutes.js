import express from "express";
import prisma from "../config/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const bases = await prisma.base.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        name: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      bases,
    });
  } catch (error) {
    console.error("Get bases error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load bases",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid base ID",
      });
    }

    const base = await prisma.base.findUnique({
      where: {
        id,
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    if (!base) {
      return res.status(404).json({
        success: false,
        message: "Base not found",
      });
    }

    res.json({
      success: true,
      base,
    });
  } catch (error) {
    console.error("Get base error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load base",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: "Name and location are required",
      });
    }

    const existingBase = await prisma.base.findUnique({
      where: {
        name,
      },
    });

    if (existingBase) {
      return res.status(409).json({
        success: false,
        message: "Base already exists",
      });
    }

    const base = await prisma.base.create({
      data: {
        name,
        location,
      },
    });

    res.status(201).json({
      success: true,
      message: "Base created successfully",
      base,
    });
  } catch (error) {
    console.error("Create base error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create base",
    });
  }
});

export default router;
