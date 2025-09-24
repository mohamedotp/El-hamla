// /app/api/products/[id]/route.ts

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
  _: NextRequest,
  { params: paramsProps }: { params: Promise<{ id: string }> },
) {
  const params = await paramsProps;

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        barcode: true,
        unit: true,
        category: true,
        receivingParty: true,
        batches: {
          select: {
            id: true,
            batchNumber: true,
            quantity: true,
            soldQuantity: true,
            price: true,
            purchaseItem: {
              include: {
                purchaseInvoice: {
                  include: {
                    Buyer: true,
                  },
                },
              },
            },
            vehicle: true,
            salesItems: {
              include: {
                salesInvoice: true,
              },
            },
          },
        },
        purchaseItems: {
          orderBy: {
            purchaseInvoice: {
              date: "desc",
            },
          },
          include: {
            purchaseInvoice: {
              include: {
                Buyer: true,
                supplier: true,
                items: {
                  include: {
                    product: true,
                  },
                },
              },
            },
            batch: {
              include: {
                salesItems: true,
              },
            },
          },
        },
        salesItems: {
          orderBy: {
            salesInvoice: {
              date: "desc",
            },
          },
          include: {
            salesInvoice: {
              include: {
                vehicle: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    return NextResponse.json(
      { error: "خطأ في جلب تفاصيل المنتج" },
      { status: 500 },
    );
  }
}


// app/api/products/[id]/route.ts

export async function DELETE(
  req: Request,
  { params: paramsProps }: { params: Promise<{ id: string }> }
) {
  const params = await paramsProps;
  
  try {
    // التحقق من وجود المنتج أولاً
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    // التحقق من عدم وجود علاقات قبل الحذف
    const purchaseItemsCount = await prisma.purchaseInvoiceItem.count({
      where: { productId: params.id },
    });

    const salesItemsCount = await prisma.salesInvoiceItem.count({
      where: { productId: params.id },
    });

    if (purchaseItemsCount > 0 || salesItemsCount > 0) {
      return NextResponse.json(
        { 
          error: "لا يمكن حذف المنتج لأنه مستخدم في فواتير",
          purchaseInvoices: purchaseItemsCount,
          salesInvoices: salesItemsCount
        },
        { status: 400 }
      );
    }

    // حذف المنتج
    await prisma.product.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "فشل حذف المنتج", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
