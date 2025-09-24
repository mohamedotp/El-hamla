import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("term");
    const type = searchParams.get("type"); // vehicle, workOrder, product
    const vehicleId = searchParams.get("vehicleId");

    if (!searchTerm && !vehicleId) {
      return NextResponse.json([]);
    }

    // البحث عن السيارات
    if (type === "vehicle" && searchTerm) {
      const vehicles = await prisma.vehicle.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { Government_number: { contains: searchTerm, mode: "insensitive" } },
            { royal_number: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        include: {
          workOrders: {
            orderBy: { date_number_work: "desc" },
            take: 5,
          },
        },
        take: 10,
      });

      return NextResponse.json(vehicles);
    }

    // البحث عن أوامر العمل لسيارة محددة
    if (type === "workOrder" && vehicleId) {
      const workOrders = await prisma.workOrder.findMany({
        where: { vehicleId },
        orderBy: { date_number_work: "desc" },
      });

      return NextResponse.json(workOrders);
    }

    // البحث عن المنتجات
    if (type === "product" && searchTerm) {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { barcode: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        include: {
          batches: {
            where: { quantity: { gt: 0 } },
            include: {
              purchaseItem: {
                include: {
                  purchaseInvoice: {
                    include: {
                      supplier: true,
                    },
                  },
                },
              },
            },
          },
        },
        take: 10,
      });

      // تحويل البيانات لتسهيل استخدامها في واجهة المستخدم
      const formattedProducts = products.map(product => ({
        ...product,
        batches: product.batches.map(batch => ({
          ...batch,
          // إضافة السعر والمورد مع التحقق من وجود purchaseItem و purchaseInvoice
          purchasePrice: batch.purchaseItem?.purchasePrice || 0,
          supplier: batch.purchaseItem?.purchaseInvoice?.supplier?.name || "غير معروف",
        })),
      }));

      return NextResponse.json(formattedProducts);
    }

    // البحث عن فنيي الصيانة
    if (type === "repairMan") {
      const repairMen = await prisma.repairMan.findMany({
        orderBy: { name: "asc" },
      });

      return NextResponse.json(repairMen);
    }

    // البحث عن مسؤولي الصيانة
    if (type === "bolRepairMan") {
      const bolRepairMen = await prisma.bolRepairMan.findMany({
        orderBy: { name: "asc" },
      });

      return NextResponse.json(bolRepairMen);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("خطأ في البحث:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء البحث" },
      { status: 500 }
    );
  }
}
