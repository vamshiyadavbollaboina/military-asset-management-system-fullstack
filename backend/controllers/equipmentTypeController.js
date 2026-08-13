import prisma from "../config/prisma.js";

export const getEquipmentTypes = async (req, res) => {
  try {
    const equipmentTypes = await prisma.equipmentType.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      count: equipmentTypes.length,
      equipmentTypes,
    });
  } catch (error) {
    console.error("GET EQUIPMENT TYPES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch equipment types",
      error: error.message,
    });
  }
};
