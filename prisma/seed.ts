import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const department = await prisma.department.upsert({
    where: { code: "DEMO" },
    update: { name: "หน่วยงานตัวอย่าง" },
    create: { code: "DEMO", name: "หน่วยงานตัวอย่าง" },
  });

  await prisma.user.upsert({
    where: { externalId: "demo-staff" },
    update: { name: "ผู้ใช้ตัวอย่าง", role: UserRole.STAFF, departmentId: department.id },
    create: {
      externalId: "demo-staff",
      name: "ผู้ใช้ตัวอย่าง",
      role: UserRole.STAFF,
      departmentId: department.id,
    },
  });

  await prisma.user.upsert({
    where: { externalId: "demo-finance" },
    update: { name: "การเงินตัวอย่าง", role: UserRole.FINANCE, departmentId: department.id },
    create: {
      externalId: "demo-finance",
      name: "การเงินตัวอย่าง",
      role: UserRole.FINANCE,
      departmentId: department.id,
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
