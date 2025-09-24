import { prisma } from "@/lib/prisma"; // عدل هذا المسار حسب مكان prisma client

async function main() {
  // مسح الجداول مع استثناء الجداول المحددة
  await prisma.workOrder.deleteMany({});
  await prisma.vehicle.deleteMany({});

  console.log("✅ All data deleted except for User, Supplier, Buyer, repairMan, bolRepairMan");
}

main()
  .catch((e) => {
    console.error("❌ Error while cleaning DB:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
