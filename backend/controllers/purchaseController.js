import prisma from "../config/prisma.js";

export const getPurchases = async (req, res) => {
  try {
    const where = {};

    if (req.user.role !== "ADMIN") {
      if (!req.user.baseId) {
        return res.status(400).json({
          success: false,
          message: "User is not assigned to a base",
        });
      }

      where.baseId = Number(req.user.baseId);
    }

    const purchases = await prisma.purchase.findMany({
      where,

      include: {
        base: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },

        equipmentType: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },

      orderBy: {
        purchaseDate: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      purchases,
    });
  } catch (error) {
    console.error("GET PURCHASES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchases",
      error: error.message,
    });
  }
};

export const createPurchase = async (req, res) => {
  try {
    let { baseId, equipmentTypeId, quantity, date, purchaseDate } = req.body;

    if (!equipmentTypeId) {
      return res.status(400).json({
        success: false,
        message: "Equipment type is required",
      });
    }

    if (!quantity) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
    }

    const parsedEquipmentTypeId = Number(equipmentTypeId);
    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedEquipmentTypeId)) {
      return res.status(400).json({
        success: false,
        message: "Equipment type ID must be an integer",
      });
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    if (req.user.role !== "ADMIN") {
      baseId = req.user.baseId;
    }

    if (!baseId) {
      return res.status(400).json({
        success: false,
        message: "Base is required",
      });
    }

    const parsedBaseId = Number(baseId);

    if (!Number.isInteger(parsedBaseId)) {
      return res.status(400).json({
        success: false,
        message: "Base ID must be an integer",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    const base = await prisma.base.findUnique({
      where: {
        id: parsedBaseId,
      },
    });

    if (!base) {
      return res.status(404).json({
        success: false,
        message: "Base not found",
      });
    }

    const equipment = await prisma.equipmentType.findUnique({
      where: {
        id: parsedEquipmentTypeId,
      },
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment type not found",
      });
    }

    const finalPurchaseDate =
      purchaseDate || date ? new Date(purchaseDate || date) : new Date();

    if (Number.isNaN(finalPurchaseDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase date",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          baseId: parsedBaseId,
          equipmentTypeId: parsedEquipmentTypeId,
          quantity: parsedQuantity,

          purchaseDate: finalPurchaseDate,

          createdById: Number(req.user.id),
        },

        include: {
          base: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },

          equipmentType: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },

          createdBy: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: Number(req.user.id),
          action: "PURCHASE",
          details: `Purchased ${parsedQuantity} units of ${equipment.name} for ${base.name}`,
        },
      });

      return purchase;
    });

    return res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      purchase: result,
    });
  } catch (error) {
    console.error("CREATE PURCHASE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create purchase",
      error: error.message,
    });
  }
};

export const getPurchaseById = async (req, res) => {
  try {
    const purchaseId = Number(req.params.id);

    if (!Number.isInteger(purchaseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase ID",
      });
    }

    const purchase = await prisma.purchase.findUnique({
      where: {
        id: purchaseId,
      },

      include: {
        base: true,
        equipmentType: true,

        createdBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      purchase.baseId !== Number(req.user.baseId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      purchase,
    });
  } catch (error) {
    console.error("GET PURCHASE BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchase",
      error: error.message,
    });
  }
};
