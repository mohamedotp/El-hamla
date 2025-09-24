import { prisma } from "@/lib/prisma";
import { Status2, Role } from "@prisma/client";

export async function searchSalesInvoices(searchTerm: string, role: Role) {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  // تحديد الاستعلام بناءً على دور المستخدم
  const whereClause = {
    OR: [
      { id: { contains: searchTerm, mode: "insensitive" as const } },
    ],
    ...(role === "maintenance" ? { createdBy: Role.maintenance } : {}),
    ...(role === "warehouse" ? { approvalStatus: { equals: Status2.Approved } } : {}),
  };

  const invoices = await prisma.salesInvoice.findMany({
    where: whereClause,
    include: {
      vehicle: true,
      repairMan: {
        select: {
          id: true,
          name: true,
          workshopName: true,
        }
      },
      bolRepairMan: true,
      workOrder: true,
      items: {
        include: {
          batch: {
            include: {
              product: true,
            },
          },
          product: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 20,
  });

  return invoices;
}

export async function getSalesInvoiceById(id: string) {
  if (!id) {
    return null;
  }

  const invoice = await prisma.salesInvoice.findUnique({
    where: { id },
    include: {
      vehicle: true,
      repairMan: {
        select: {
          id: true,
          name: true,
          workshopName: true,
        }
      },
      bolRepairMan: true,
      workOrder: true,
      items: {
        include: {
          batch: {
            include: {
              product: true,
            },
          },
          product: true,
        },
      },
    },
  });

  return invoice;
}

export async function getVehicleWorkOrders(vehicleId: string) {
  if (!vehicleId) {
    return [];
  }

  const workOrders = await prisma.workOrder.findMany({
    where: { vehicleId },
    orderBy: { date: "desc" },
  });

  return workOrders;
}

export async function getProductBatches(productId: string) {
  if (!productId) {
    return [];
  }

  const batches = await prisma.productBatch.findMany({
    where: { 
      productId,
      quantity: { gt: 0 } // فقط الدفعات التي لديها كمية متاحة
    },
    include: {
      product: true,
      purchaseItem: {
        include: {
          product: true,
          purchaseInvoice: {
            include: {
              supplier: true,
            },
          },
        },
      },
    },
  });

  return batches;
}

export async function getRepairMen() {
  const repairMen = await prisma.repairMan.findMany({
    orderBy: { name: "asc" },
  });

  return repairMen;
}

export async function getBolRepairMen() {
  const bolRepairMen = await prisma.bolRepairMan.findMany({
    orderBy: { name: "asc" },
  });

  return bolRepairMen;
}