import prisma from "../config/prisma.js";

const getAvailableStock = async (tx, baseId, equipmentTypeId) => {
  const purchases = await tx.purchase.aggregate({
    _sum: { quantity: true },
    where: {
      baseId,
      equipmentTypeId,
    },
  });

  const transfersIn = await tx.transfer.aggregate({
    _sum: { quantity: true },
    where: {
      destinationBaseId: baseId,
      equipmentTypeId,
      status: "COMPLETED",
    },
  });

  const transfersOut = await tx.transfer.aggregate({
    _sum: { quantity: true },
    where: {
      sourceBaseId: baseId,
      equipmentTypeId,
      status: "COMPLETED",
    },
  });

  const assignments = await tx.assignment.aggregate({
    _sum: { quantity: true },
    where: {
      baseId,
      equipmentTypeId,
    },
  });

  const expenditures = await tx.expenditure.aggregate({
    _sum: { quantity: true },
    where: {
      baseId,
      equipmentTypeId,
    },
  });

  return (
    (purchases._sum.quantity || 0) +
    (transfersIn._sum.quantity || 0) -
    (transfersOut._sum.quantity || 0) -
    (assignments._sum.quantity || 0) -
    (expenditures._sum.quantity || 0)
  );
};

export const createExpenditure = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, reason, expendedDate } =
      req.body;

    if (
      baseId === undefined ||
      equipmentTypeId === undefined ||
      quantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "baseId, equipmentTypeId and quantity are required",
      });
    }

    const parsedBaseId = Number(baseId);
    const parsedEquipmentId = Number(equipmentTypeId);
    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedBaseId) ||
      !Number.isInteger(parsedEquipmentId) ||
      !Number.isInteger(parsedQuantity)
    ) {
      return res.status(400).json({
        success: false,
        message: "IDs and quantity must be integers",
      });
    }

    if (parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    if (req.user.role !== "ADMIN" && parsedBaseId !== Number(req.user.baseId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to expend assets from this base",
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
        id: parsedEquipmentId,
      },
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment type not found",
      });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const availableStock = await getAvailableStock(
          tx,
          parsedBaseId,
          parsedEquipmentId,
        );

        if (availableStock < parsedQuantity) {
          throw new Error(`INSUFFICIENT_STOCK:${availableStock}`);
        }

        const expenditure = await tx.expenditure.create({
          data: {
            baseId: parsedBaseId,
            equipmentTypeId: parsedEquipmentId,
            quantity: parsedQuantity,
            reason: reason || "Operational use",
            expendedDate: expendedDate ? new Date(expendedDate) : new Date(),
            recordedById: req.user.id,
          },
          include: {
            base: true,
            equipmentType: true,
            recordedBy: {
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
            userId: req.user.id,
            action: "EXPENDITURE",
            details:
              `Expended ${parsedQuantity} units of ${equipment.name} ` +
              `at ${base.name}. Reason: ${reason || "Operational use"}`,
          },
        });

        return {
          expenditure,
          stockBefore: availableStock,
          stockAfter: availableStock - parsedQuantity,
        };
      },
      {
        isolationLevel: "Serializable",
      },
    );

    return res.status(201).json({
      success: true,
      message: "Expenditure recorded successfully",
      expenditure: result.expenditure,
      inventory: {
        stockBefore: result.stockBefore,
        stockAfter: result.stockAfter,
      },
    });
  } catch (error) {
    console.error("Create expenditure error:", error);

    if (error.message?.startsWith("INSUFFICIENT_STOCK:")) {
      return res.status(400).json({
        success: false,
        message: "Insufficient inventory",
        availableStock: Number(error.message.split(":")[1]),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to record expenditure",
      error: error.message,
    });
  }
};

export const getExpenditures = async (req, res) => {
  try {
    let { baseId, equipmentTypeId } = req.query;

    if (req.user.role !== "ADMIN") {
      baseId = req.user.baseId;
    }

    const where = {};

    if (baseId) {
      where.baseId = Number(baseId);
    }

    if (equipmentTypeId) {
      where.equipmentTypeId = Number(equipmentTypeId);
    }

    const expenditures = await prisma.expenditure.findMany({
      where,
      include: {
        base: true,
        equipmentType: true,
        recordedBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        expendedDate: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: expenditures.length,
      expenditures,
    });
  } catch (error) {
    console.error("Get expenditures error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expenditures",
      error: error.message,
    });
  }
};

export const getExpenditureById = async (req, res) => {
  try {
    const expenditureId = Number(req.params.id);

    if (!Number.isInteger(expenditureId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expenditure ID",
      });
    }

    const expenditure = await prisma.expenditure.findUnique({
      where: {
        id: expenditureId,
      },
      include: {
        base: true,
        equipmentType: true,
        recordedBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: "Expenditure not found",
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      expenditure.baseId !== Number(req.user.baseId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      expenditure,
    });
  } catch (error) {
    console.error("Get expenditure error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch expenditure",
      error: error.message,
    });
  }
};
