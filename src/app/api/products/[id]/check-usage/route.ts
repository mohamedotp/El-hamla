import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params: paramsProps }: { params: Promise<{ id: string }> }
) {
  const params = await paramsProps;
  
  try {
    const productId = params.id;

    // التحقق من وجود المنتج في فواتير المشتريات
    const purchaseInvoicesCount = await prisma.purchaseInvoiceItem.count({
      where: {
        productId: productId,
      },
    });

    // التحقق من وجود المنتج في فواتير المبيعات
    const salesInvoicesCount = await prisma.salesInvoiceItem.count({
      where: {
        productId: productId,
      },
    });

    const hasUsage = purchaseInvoicesCount > 0 || salesInvoicesCount > 0;

    return NextResponse.json({
      hasUsage,
      purchaseInvoices: purchaseInvoicesCount,
      salesInvoices: salesInvoicesCount,
    });
  } catch (error) {
    console.error("خطأ في التحقق من استخدام المنتج:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحقق من استخدام المنتج" },
      { status: 500 }
    );
  }
} 