import prisma from "../config/prisma.js";

export const getAuditLogs = async (req, res) => {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      auditLogs,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load audit logs",
      error: error.message,
    });
  }
};
