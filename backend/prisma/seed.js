import bcrypt from "bcryptjs";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Starting database seed...");
  await prisma.auditLog.deleteMany();
  await prisma.expenditure.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.user.deleteMany();
  await prisma.equipmentType.deleteMany();
  await prisma.base.deleteMany();

  const alphaBase = await prisma.base.create({
    data: {
      name: "Fort Alpha",
      location: "Hyderabad",
    },
  });

  const bravoBase = await prisma.base.create({
    data: {
      name: "Fort Bravo",
      location: "Bengaluru",
    },
  });

  const charlieBase = await prisma.base.create({
    data: {
      name: "Fort Charlie",
      location: "Chennai",
    },
  });

  const m4 = await prisma.equipmentType.create({
    data: {
      name: "M4 Carbine",
      category: "WEAPON",
    },
  });

  const ak47 = await prisma.equipmentType.create({
    data: {
      name: "AK-47",
      category: "WEAPON",
    },
  });

  const humvee = await prisma.equipmentType.create({
    data: {
      name: "Humvee",
      category: "VEHICLE",
    },
  });

  const ammo556 = await prisma.equipmentType.create({
    data: {
      name: "5.56mm Ammunition",
      category: "AMMUNITION",
    },
  });

  const ammo762 = await prisma.equipmentType.create({
    data: {
      name: "7.62mm Ammunition",
      category: "AMMUNITION",
    },
  });

  const adminPassword = await bcrypt.hash("AdminPass123!", 10);

  const commanderPassword = await bcrypt.hash("CommandPass123!", 10);

  const logisticsPassword = await bcrypt.hash("LogisticsPass123!", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin_user",
      passwordHash: adminPassword,
      role: "ADMIN",
      baseId: null,
    },
  });

  const commander = await prisma.user.create({
    data: {
      username: "commander_alpha",
      passwordHash: commanderPassword,
      role: "BASE_COMMANDER",
      baseId: alphaBase.id,
    },
  });

  const logistics = await prisma.user.create({
    data: {
      username: "logistics_officer",
      passwordHash: logisticsPassword,
      role: "LOGISTICS_OFFICER",
      baseId: alphaBase.id,
    },
  });

  await prisma.purchase.createMany({
    data: [
      {
        baseId: alphaBase.id,
        equipmentTypeId: m4.id,
        quantity: 100,
        createdById: admin.id,
      },
      {
        baseId: alphaBase.id,
        equipmentTypeId: ammo556.id,
        quantity: 5000,
        createdById: admin.id,
      },
      {
        baseId: alphaBase.id,
        equipmentTypeId: humvee.id,
        quantity: 10,
        createdById: admin.id,
      },
      {
        baseId: bravoBase.id,
        equipmentTypeId: m4.id,
        quantity: 60,
        createdById: admin.id,
      },
      {
        baseId: bravoBase.id,
        equipmentTypeId: ammo556.id,
        quantity: 3000,
        createdById: admin.id,
      },
      {
        baseId: charlieBase.id,
        equipmentTypeId: ak47.id,
        quantity: 80,
        createdById: admin.id,
      },
      {
        baseId: charlieBase.id,
        equipmentTypeId: ammo762.id,
        quantity: 4000,
        createdById: admin.id,
      },
    ],
  });

  await prisma.transfer.create({
    data: {
      sourceBaseId: alphaBase.id,
      destinationBaseId: bravoBase.id,
      equipmentTypeId: m4.id,
      quantity: 20,
      status: "COMPLETED",
      initiatedById: logistics.id,
    },
  });

  await prisma.transfer.create({
    data: {
      sourceBaseId: bravoBase.id,
      destinationBaseId: alphaBase.id,
      equipmentTypeId: ammo556.id,
      quantity: 500,
      status: "COMPLETED",
      initiatedById: logistics.id,
    },
  });

  await prisma.assignment.create({
    data: {
      baseId: alphaBase.id,
      equipmentTypeId: m4.id,
      personnelName: "Unit Alpha-01",
      quantity: 30,
      assignedById: commander.id,
    },
  });

  await prisma.assignment.create({
    data: {
      baseId: alphaBase.id,
      equipmentTypeId: ammo556.id,
      personnelName: "Unit Alpha-01",
      quantity: 1000,
      assignedById: commander.id,
    },
  });

  await prisma.expenditure.create({
    data: {
      baseId: alphaBase.id,
      equipmentTypeId: ammo556.id,
      quantity: 500,
      reason: "Training exercise",
      recordedById: commander.id,
    },
  });

  await prisma.expenditure.create({
    data: {
      baseId: charlieBase.id,
      equipmentTypeId: ammo762.id,
      quantity: 300,
      reason: "Live firing exercise",
      recordedById: admin.id,
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: "CREATE",
        details: "Initial system data created",
      },
      {
        userId: admin.id,
        action: "PURCHASE",
        details: "Initial inventory purchases created",
      },
      {
        userId: logistics.id,
        action: "TRANSFER",
        details: "M4 Carbines transferred from Fort Alpha to Fort Bravo",
      },
      {
        userId: logistics.id,
        action: "TRANSFER",
        details: "5.56mm Ammunition transferred from Fort Bravo to Fort Alpha",
      },
      {
        userId: commander.id,
        action: "ASSIGNMENT",
        details: "M4 Carbines assigned to Unit Alpha-01",
      },
      {
        userId: commander.id,
        action: "EXPENDITURE",
        details: "5.56mm Ammunition expended during training",
      },
    ],
  });

  console.log("Database seeded successfully!");

  console.log("\nTest Accounts:");
  console.log("------------------------------");
  console.log("Admin:");
  console.log("Username: admin_user");
  console.log("Password: AdminPass123!");

  console.log("\nBase Commander:");
  console.log("Username: commander_alpha");
  console.log("Password: CommandPass123!");

  console.log("\nLogistics Officer:");
  console.log("Username: logistics_officer");
  console.log("Password: LogisticsPass123!");

  console.log("------------------------------");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
