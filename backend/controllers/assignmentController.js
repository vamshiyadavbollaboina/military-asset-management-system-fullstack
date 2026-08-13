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


export const createAssignment = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, personnelName, quantity, assignedDate } =
      req.body;

    if (
      baseId === undefined ||
      equipmentTypeId === undefined ||
      !personnelName ||
      quantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "baseId, equipmentTypeId, personnelName and quantity are required",
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

    if (req.user.role !== "ADMIN") {
      if (parsedBaseId !== Number(req.user.baseId)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to assign assets from this base",
        });
      }
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

        const assignment = await tx.assignment.create({
          data: {
            baseId: parsedBaseId,
            equipmentTypeId: parsedEquipmentId,
            personnelName,
            quantity: parsedQuantity,
            assignedDate: assignedDate ? new Date(assignedDate) : new Date(),
            assignedById: req.user.id,
          },
          include: {
            base: true,
            equipmentType: true,
            assignedBy: {
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
            action: "ASSIGNMENT",
            details:
              `Assigned ${parsedQuantity} units of ${equipment.name} ` +
              `to ${personnelName} at ${base.name}`,
          },
        });

        return {
          assignment,
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
      message: "Asset assigned successfully",
      assignment: result.assignment,
      inventory: {
        stockBefore: result.stockBefore,
        stockAfter: result.stockAfter,
      },
    });
  } catch (error) {
    console.error("Create assignment error:", error);

    if (error.message?.startsWith("INSUFFICIENT_STOCK:")) {
      return res.status(400).json({
        success: false,
        message: "Insufficient inventory",
        availableStock: Number(error.message.split(":")[1]),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create assignment",
      error: error.message,
    });
  }
};


export const getAssignments = async (req, res) => {
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

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        base: true,
        equipmentType: true,
        assignedBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        assignedDate: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};


export const getAssignmentById = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);

    if (!Number.isInteger(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        base: true,
        equipmentType: true,
        assignedBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      assignment.baseId !== Number(req.user.baseId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error("Get assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignment",
      error: error.message,
    });
  }
};
