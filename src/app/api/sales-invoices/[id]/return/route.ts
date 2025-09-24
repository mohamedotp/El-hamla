import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const invoiceId = params.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.salesInvoice.findUnique({
        where: { id: invoiceId },
        include: { items: true },
      });

      if (!invoice) {
        throw new Error("فاتورة المبيعات غير موجودة");
      }

      for (const item of invoice.items) {
        await tx.productBatch.update({
          where: { id: item.batchId },
          data: {
            quantity: { increment: item.soldQuantity },
            soldQuantity: { decrement: item.soldQuantity },
          },
        });
      }

      await tx.salesInvoiceItem.deleteMany({
        where: { salesInvoiceId: invoiceId },
      });

      await tx.salesInvoice.delete({
        where: { id: invoiceId },
      });
    });

    return NextResponse.json({ message: "تم تنفيذ المرتجع بنجاح" });
  } catch (error) {
    console.error("خطأ أثناء تنفيذ المرتجع:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تنفيذ المرتجع" },
      { status: 500 }
    );
  }
}
