import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params: paramsProps }: { params: Promise<{ id: string }> }
) {
  const params = await paramsProps;
  
  try {
    // جلب فواتير المشتريات المرتبطة بالمنتج
    const purchaseInvoices = await prisma.purchaseInvoiceItem.findMany({
      where: {
        productId: params.id,
      },
      include: {
        purchaseInvoice: {
          include: {
            Buyer: true,
            supplier: true,
          },
        },
      },
    });

    // جلب فواتير المبيعات المرتبطة بالمنتج
    const salesInvoices = await prisma.salesInvoiceItem.findMany({
      where: {
        productId: params.id,
      },
      include: {
        salesInvoice: {
          include: {
            vehicle: true,
          },
        },
      },
    });

    return NextResponse.json({
      purchaseInvoices: purchaseInvoices.map(item => ({
        id: item.purchaseInvoice.id,
        date: item.purchaseInvoice.date,
        buyer: item.purchaseInvoice.Buyer?.name,
        supplier: item.purchaseInvoice.supplier?.name,
        quantity: item.quantity,
        price: item.purchasePrice,
      })),
      salesInvoices: salesInvoices.map(item => ({
        id: item.salesInvoice.id,
        date: item.salesInvoice.date,
        vehicle: item.salesInvoice.vehicle?.name || item.salesInvoice.vehicle?.Government_number,
        quantity: item.soldQuantity,
        price: item.unitPrice,
      })),
    });
  } catch (error) {
    console.error("خطأ في جلب فواتير المنتج:", error);
    return NextResponse.json(
      { error: "فشل جلب فواتير المنتج" },
      { status: 500 }
    );
  }
} 