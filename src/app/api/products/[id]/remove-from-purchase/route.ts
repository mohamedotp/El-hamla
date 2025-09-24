import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params: paramsProps }: { params: Promise<{ id: string }> }
) {
  const params = await paramsProps;
  const { searchParams } = new URL(req.url);
  const purchaseInvoiceId = searchParams.get('purchaseInvoiceId');
  
  if (!purchaseInvoiceId) {
    return NextResponse.json(
      { error: "معرف فاتورة المشتريات مطلوب" },
      { status: 400 }
    );
  }

  try {
    // حذف الدفعات المرتبطة بهذا المنتج في هذه الفاتورة أولاً
    await prisma.productBatch.deleteMany({
      where: {
        productId: params.id,
        purchaseItem: {
          purchaseInvoiceId: purchaseInvoiceId,
        },
      },
    });

    // حذف المنتج من فاتورة المشتريات المحددة
    await prisma.purchaseInvoiceItem.deleteMany({
      where: {
        productId: params.id,
        purchaseInvoiceId: purchaseInvoiceId,
      },
    });

    // التحقق من وجود منتجات أخرى في نفس الفاتورة
    const remainingItems = await prisma.purchaseInvoiceItem.count({
      where: {
        purchaseInvoiceId: purchaseInvoiceId,
      },
    });

    // إذا لم تتبقى منتجات أخرى، احذف الفاتورة بالكامل
    if (remainingItems === 0) {
      await prisma.purchaseInvoice.delete({
        where: {
          id: purchaseInvoiceId,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      message: "تم حذف المنتج من فاتورة المشتريات بنجاح",
      invoiceDeleted: remainingItems === 0
    });
  } catch (error) {
    console.error("خطأ في حذف المنتج من فاتورة المشتريات:", error);
    return NextResponse.json(
      { error: "فشل حذف المنتج من فاتورة المشتريات" },
      { status: 500 }
    );
  }
} 