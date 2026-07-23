// prisma/seed.ts
// Run: npm run db:seed
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed technicians
  const techs = [
    { name: "Ravi Kumar",    employeeId: "TECH-001", email: "ravi@servyn.in",    phone: "9876543210" },
    { name: "Priya Sharma",  employeeId: "TECH-002", email: "priya@servyn.in",   phone: "9876543211" },
    { name: "Arun Das",      employeeId: "TECH-003", email: "arun@servyn.in",    phone: "9876543212" },
  ];

  for (const t of techs) {
    await prisma.technician.upsert({
      where: { employeeId: t.employeeId },
      update: {},
      create: t,
    });
  }

  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { ratePerPoint: 2.0 },
  });

  console.log("✅ Seed complete — 3 technicians, settings created");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
