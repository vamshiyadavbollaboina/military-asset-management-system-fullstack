const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getBases = async (req, res) => {
  try {
    const bases = await prisma.base.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      bases,
    });
  } catch (error) {
    console.error("Get bases error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load bases",
    });
  }
};

const getBaseById = async (req, res) => {
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
    });

    if (!base) {
      return res.status(404).json({
        success: false,
        message: "Base not found",
      });
    }

    return res.status(200).json({
      success: true,
      base,
    });
  } catch (error) {
    console.error("Get base error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load base",
    });
  }
};

const createBase = async (req, res) => {
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

    return res.status(201).json({
      success: true,
      message: "Base created successfully",
      base,
    });
  } catch (error) {
    console.error("Create base error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create base",
    });
  }
};

const updateBase = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const { name, location } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid base ID",
      });
    }

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: "Name and location are required",
      });
    }

    const base = await prisma.base.update({
      where: {
        id,
      },
      data: {
        name,
        location,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Base updated successfully",
      base,
    });
  } catch (error) {
    console.error("Update base error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update base",
    });
  }
};

const deleteBase = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid base ID",
      });
    }

    await prisma.base.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Base deleted successfully",
    });
  } catch (error) {
    console.error("Delete base error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot delete base. It may already be used by other records.",
    });
  }
};

module.exports = {
  getBases,
  getBaseById,
  createBase,
  updateBase,
  deleteBase,
};
