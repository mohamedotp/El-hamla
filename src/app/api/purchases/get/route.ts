import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { routeHandlerWrapper } from "@/lib/route-handler-wrapper";

export const GET = routeHandlerWrapper(async (req: NextRequest) => {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const invoiceId = url.searchParams.get("invoiceId");
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  const skip = (page - 1) * limit;

  // بناء شروط البحث
  const where: any = {};

  // البحث حسب معرف الفاتورة
  if (invoiceId) {
    where.id = invoiceId;
  }

  // البحث حسب التاريخ
  if (startDate || endDate) {
    where.date = {};
    
    if (startDate) {
      where.date.gte = new Date(startDate);
    }
    
    if (endDate) {
      where.date.lte = new Date(endDate);
    }
  }

  try {
    // جلب إجمالي عدد الفواتير للترقيم
    const total = await prisma.purchaseInvoice.count({ where });

    // جلب الفواتير مع البيانات المرتبطة
    const invoices = await prisma.purchaseInvoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        date: "desc",
      },
      include: {
        supplier: true,
        Buyer: true,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        items: {
          include: {
            product: true,
            vehicle: true,
          },
        },
      },
    });

    return NextResponse.json({
      invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching purchase invoices:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب فواتير المشتريات" },
      { status: 500 }
    );
  }
});