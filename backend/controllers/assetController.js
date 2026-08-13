import prisma from "../config/prisma.js";

export const getDashboardMetrics = async (req, res) => {
  try {
    let { baseId, equipmentTypeId } = req.query;

    if (req.user.role !== "ADMIN") {
      baseId = req.user.baseId;
    }

    const baseFilter = baseId ? { baseId: Number(baseId) } : {};

    const equipmentFilter = equipmentTypeId
      ? {
          equipmentTypeId: Number(equipmentTypeId),
        }
      : {};

    const purchases = await prisma.purchase.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        ...baseFilter,
        ...equipmentFilter,
      },
    });

    const transfersIn = await prisma.transfer.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        ...equipmentFilter,
        ...(baseId ? { destinationBaseId: Number(baseId) } : {}),
        status: "COMPLETED",
      },
    });

    const transfersOut = await prisma.transfer.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        ...equipmentFilter,
        ...(baseId ? { sourceBaseId: Number(baseId) } : {}),
        status: "COMPLETED",
      },
    });

    const assignments = await prisma.assignment.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        ...baseFilter,
        ...equipmentFilter,
      },
    });

    const expenditures = await prisma.expenditure.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        ...baseFilter,
        ...equipmentFilter,
      },
    });

    const purchaseTotal = purchases._sum.quantity || 0;

    const transferInTotal = transfersIn._sum.quantity || 0;

    const transferOutTotal = transfersOut._sum.quantity || 0;

    const assignedTotal = assignments._sum.quantity || 0;

    const expendedTotal = expenditures._sum.quantity || 0;

    const netMovement = purchaseTotal + transferInTotal - transferOutTotal;

    const closingBalance = netMovement - assignedTotal - expendedTotal;

    return res.json({
      success: true,

      openingBalance: 0,

      purchases: purchaseTotal,

      transfersIn: transferInTotal,

      transfersOut: transferOutTotal,

      netMovement,

      assigned: assignedTotal,

      expended: expendedTotal,

      closingBalance,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to calculate dashboard metrics",
    });
  }
};
