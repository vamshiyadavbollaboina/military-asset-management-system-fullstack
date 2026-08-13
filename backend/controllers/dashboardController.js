import prisma from "../config/prisma.js";

export const getDashboardMetrics = async (req, res) => {
  try {
    let { baseId, equipmentTypeId, startDate, endDate } = req.query;

    if (req.user.role !== "ADMIN") {
      baseId = req.user.baseId;
    }

    if (baseId) {
      baseId = Number(baseId);
    }

    if (equipmentTypeId) {
      equipmentTypeId = Number(equipmentTypeId);
    }

    const start = startDate ? new Date(startDate) : new Date("2000-01-01");

    const end = endDate ? new Date(endDate) : new Date();
    if (endDate) {
      end.setHours(23, 59, 59, 999);
    }

    const baseFilter = baseId ? { baseId } : {};

    const equipmentFilter = equipmentTypeId ? { equipmentTypeId } : {};

    const purchases = await prisma.purchase.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        ...baseFilter,
        ...equipmentFilter,
        purchaseDate: {
          gte: start,
          lte: end,
        },
      },
    });

    const transfersIn = await prisma.transfer.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        destinationBaseId: baseId || undefined,
        ...equipmentFilter,
        status: "COMPLETED",
        transferDate: {
          gte: start,
          lte: end,
        },
      },
    });

    const transfersOut = await prisma.transfer.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        sourceBaseId: baseId || undefined,
        ...equipmentFilter,
        status: "COMPLETED",
        transferDate: {
          gte: start,
          lte: end,
        },
      },
    });

    const assignments = await prisma.assignment.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        ...baseFilter,
        ...equipmentFilter,
        assignedDate: {
          gte: start,
          lte: end,
        },
      },
    });

    const expenditures = await prisma.expenditure.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        ...baseFilter,
        ...equipmentFilter,
        expendedDate: {
          gte: start,
          lte: end,
        },
      },
    });

    const totalPurchases = purchases._sum.quantity || 0;
    const totalTransfersIn = transfersIn._sum.quantity || 0;
    const totalTransfersOut = transfersOut._sum.quantity || 0;
    const totalAssigned = assignments._sum.quantity || 0;
    const totalExpended = expenditures._sum.quantity || 0;

    const netMovement = totalPurchases + totalTransfersIn - totalTransfersOut;

    const openingBalance = 0;

    const closingBalance =
      openingBalance + netMovement - totalAssigned - totalExpended;

    return res.status(200).json({
      success: true,
      filters: {
        baseId: baseId || null,
        equipmentTypeId: equipmentTypeId || null,
        startDate: startDate || null,
        endDate: endDate || null,
      },
      metrics: {
        openingBalance,
        purchases: totalPurchases,
        transfersIn: totalTransfersIn,
        transfersOut: totalTransfersOut,
        netMovement,
        assigned: totalAssigned,
        expended: totalExpended,
        closingBalance,
      },
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to calculate dashboard metrics",
      error: error.message,
    });
  }
};
