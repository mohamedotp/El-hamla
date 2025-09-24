// /app/api/sales-invoices/[id]/edit/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const invoiceId = params.id;
  const body = await req.json();

  try {
    // 1. تحقق من وجود الفاتورة
    const existingInvoice = await prisma.salesInvoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { error: "الفاتورة غير موجودة" },
        { status: 404 }
      );
    }

    // 2. لو تم الصرف بالفعل، لا يمكن التعديل
    if (existingInvoice.disbursementStatus === "Disbursed") {
      return NextResponse.json(
        { error: "لا يمكن تعديل فاتورة تم صرفها" },
        { status: 400 }
      );
    }

    const updatedItems = body.items;

    // 3. حذف العناصر القديمة
    await prisma.salesInvoiceItem.deleteMany({
      where: { salesInvoiceId: invoiceId },
    });

    // 4. إدخال العناصر الجديدة
    const createdItems = await prisma.salesInvoiceItem.createMany({
      data: updatedItems.map((item: any) => ({
        salesInvoiceId: invoiceId,
        productId: item.product.id || item.productId,
        batchId: item.batch.id || item.batchId,
        soldQuantity: item.soldQuantity,
        unitPrice: item.unitPrice,
      })),
    });

    // 5. حساب الإجمالي الجديد
    const totalAmount = updatedItems.reduce(
      (sum: number, item: any) =>
        sum + item.soldQuantity * item.unitPrice,
      0
    );

    // 6. تحديث الفاتورة نفسها
    await prisma.salesInvoice.update({
      where: { id: invoiceId },
      data: {
        totalAmount,
      },
    });

    // 7. إرجاع النتيجة
    return NextResponse.json({
      message: "تم تعديل الفاتورة بنجاح",
      updated: createdItems.count,
      newTotal: totalAmount,
    });
  } catch (error: any) {
    console.error("خطأ أثناء تعديل الفاتورة:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تعديل الفاتورة" },
      { status: 500 }
    );
  }
}
