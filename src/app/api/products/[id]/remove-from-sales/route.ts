import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params: paramsProps }: { params: Promise<{ id: string }> }
) {
  const params = await paramsProps;
  const { searchParams } = new URL(req.url);
  const salesInvoiceId = searchParams.get('salesInvoiceId');
  
  if (!salesInvoiceId) {
    return NextResponse.json(
      { error: "معرف فاتورة المبيعات مطلوب" },
      { status: 400 }
    );
  }

  try {
    // حذف المنتج من فاتورة المبيعات المحددة
    await prisma.salesInvoiceItem.deleteMany({
      where: {
        productId: params.id,
        salesInvoiceId: salesInvoiceId,
      },
    });

    // التحقق من وجود منتجات أخرى في نفس الفاتورة
    const remainingItems = await prisma.salesInvoiceItem.count({
      where: {
        salesInvoiceId: salesInvoiceId,
      },
    });

    // إذا لم تتبقى منتجات أخرى، احذف الفاتورة بالكامل
    if (remainingItems === 0) {
      await prisma.salesInvoice.delete({
        where: {
          id: salesInvoiceId,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      message: "تم حذف المنتج من فاتورة المبيعات بنجاح",
      invoiceDeleted: remainingItems === 0
    });
  } catch (error) {
    console.error("خطأ في حذف المنتج من فاتورة المبيعات:", error);
    return NextResponse.json(
      { error: "فشل حذف المنتج من فاتورة المبيعات" },
      { status: 500 }
    );
  }
} 