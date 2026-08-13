import prisma from "../config/prisma.js";

const calculateAvailableStock = async (tx, baseId, equipmentTypeId) => {
  const purchases = await tx.purchase.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      baseId,
      equipmentTypeId,
    },
  });

  const transfersIn = await tx.transfer.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      destinationBaseId: baseId,
      equipmentTypeId,
      status: "COMPLETED",
    },
  });

  const transfersOut = await tx.transfer.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      sourceBaseId: baseId,
      equipmentTypeId,
      status: "COMPLETED",
    },
  });

  const assignments = await tx.assignment.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      baseId,
      equipmentTypeId,
    },
  });

  const expenditures = await tx.expenditure.aggregate({
    _sum: {
      quantity: true,
    },
    where: {
      baseId,
      equipmentTypeId,
    },
  });

  const totalPurchases = purchases._sum.quantity || 0;
  const totalTransfersIn = transfersIn._sum.quantity || 0;
  const totalTransfersOut = transfersOut._sum.quantity || 0;
  const totalAssigned = assignments._sum.quantity || 0;
  const totalExpended = expenditures._sum.quantity || 0;

  return (
    totalPurchases +
    totalTransfersIn -
    totalTransfersOut -
    totalAssigned -
    totalExpended
  );
};

export const createTransfer = async (req, res) => {
  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } =
      req.body;

    if (
      sourceBaseId === undefined ||
      destinationBaseId === undefined ||
      equipmentTypeId === undefined ||
      quantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "sourceBaseId, destinationBaseId, equipmentTypeId and quantity are required",
      });
    }

    const sourceId = Number(sourceBaseId);
    const destinationId = Number(destinationBaseId);
    const equipmentId = Number(equipmentTypeId);
    const transferQuantity = Number(quantity);

    if (
      !Number.isInteger(sourceId) ||
      !Number.isInteger(destinationId) ||
      !Number.isInteger(equipmentId) ||
      !Number.isInteger(transferQuantity)
    ) {
      return res.status(400).json({
        success: false,
        message: "IDs and quantity must be integers",
      });
    }

    if (transferQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    if (sourceId === destinationId) {
      return res.status(400).json({
        success: false,
        message: "Source and destination bases must be different",
      });
    }

    if (req.user.role !== "ADMIN" && sourceId !== Number(req.user.baseId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to transfer assets from this base",
      });
    }

    const sourceBase = await prisma.base.findUnique({
      where: {
        id: sourceId,
      },
    });

    if (!sourceBase) {
      return res.status(404).json({
        success: false,
        message: "Source base not found",
      });
    }

    const destinationBase = await prisma.base.findUnique({
      where: {
        id: destinationId,
      },
    });

    if (!destinationBase) {
      return res.status(404).json({
        success: false,
        message: "Destination base not found",
      });
    }

    const equipment = await prisma.equipmentType.findUnique({
      where: {
        id: equipmentId,
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
        const availableStock = await calculateAvailableStock(
          tx,
          sourceId,
          equipmentId,
        );

        if (availableStock < transferQuantity) {
          throw new Error(`INSUFFICIENT_STOCK:${availableStock}`);
        }
        const transfer = await tx.transfer.create({
          data: {
            sourceBaseId: sourceId,
            destinationBaseId: destinationId,
            equipmentTypeId: equipmentId,
            quantity: transferQuantity,
            status: "COMPLETED",
            initiatedById: req.user.id,
          },
          include: {
            sourceBase: true,
            destinationBase: true,
            equipmentType: true,
            initiatedBy: {
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
            action: "TRANSFER",
            details:
              `Transferred ${transferQuantity} units of ${equipment.name} ` +
              `from ${sourceBase.name} to ${destinationBase.name}`,
          },
        });

        return {
          transfer,
          availableStockBefore: availableStock,
          availableStockAfter: availableStock - transferQuantity,
        };
      },
      {
        isolationLevel: "Serializable",
      },
    );

    return res.status(201).json({
      success: true,
      message: "Transfer completed successfully",
      transfer: result.transfer,
      inventory: {
        sourceStockBefore: result.availableStockBefore,
        sourceStockAfter: result.availableStockAfter,
      },
    });
  } catch (error) {
    console.error("Create transfer error:", error);

    if (error.message?.startsWith("INSUFFICIENT_STOCK:")) {
      const availableStock = Number(error.message.split(":")[1]);

      return res.status(400).json({
        success: false,
        message: "Insufficient inventory",
        availableStock,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Transfer failed",
      error: error.message,
    });
  }
};

export const getTransfers = async (req, res) => {
  try {
    let { baseId, equipmentTypeId, status, startDate, endDate } = req.query;

    const where = {};

    if (req.user.role !== "ADMIN") {
      const userBaseId = Number(req.user.baseId);

      where.OR = [
        {
          sourceBaseId: userBaseId,
        },
        {
          destinationBaseId: userBaseId,
        },
      ];
    } else if (baseId) {
      const requestedBaseId = Number(baseId);

      where.OR = [
        {
          sourceBaseId: requestedBaseId,
        },
        {
          destinationBaseId: requestedBaseId,
        },
      ];
    }

    if (equipmentTypeId) {
      where.equipmentTypeId = Number(equipmentTypeId);
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.transferDate = {};

      if (startDate) {
        where.transferDate.gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);

        end.setHours(23, 59, 59, 999);

        where.transferDate.lte = end;
      }
    }

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        sourceBase: true,
        destinationBase: true,
        equipmentType: true,
        initiatedBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        transferDate: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: transfers.length,
      transfers,
    });
  } catch (error) {
    console.error("Get transfers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch transfers",
      error: error.message,
    });
  }
};

export const getTransferById = async (req, res) => {
  try {
    const transferId = Number(req.params.id);

    if (!Number.isInteger(transferId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transfer ID",
      });
    }

    const transfer = await prisma.transfer.findUnique({
      where: {
        id: transferId,
      },
      include: {
        sourceBase: true,
        destinationBase: true,
        equipmentType: true,
        initiatedBy: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
    });

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    if (req.user.role !== "ADMIN") {
      const userBaseId = Number(req.user.baseId);

      const hasAccess =
        transfer.sourceBaseId === userBaseId ||
        transfer.destinationBaseId === userBaseId;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    return res.status(200).json({
      success: true,
      transfer,
    });
  } catch (error) {
    console.error("Get transfer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch transfer",
      error: error.message,
    });
  }
};
