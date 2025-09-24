import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export const PATCH = async (req: Request, context: { params: { id: string } }) => {
  const { id } = context.params;
  try {
    // قراءة بيانات الطلب (تأكد من إرسال approvalStatus في الجسم)
    const body = await req.json();

    if (!body.approvalStatus) {
      return NextResponse.json({ message: "approvalStatus مطلوب" }, { status: 400 });
    }

    // تأكد من وجود الفاتورة
    const existingInvoice = await prisma.salesInvoice.findUnique({ where: { id } });
    if (!existingInvoice) {
      return NextResponse.json({ message: "لم يتم العثور على فاتورة المبيعات" }, { status: 404 });
    }

    // تحديث حالة الموافقة فقط
    const updatedInvoice = await prisma.salesInvoice.update({
      where: { id },
      data: { approvalStatus: body.approvalStatus },
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
            product: true,
            batch: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "تم تحديث حالة الموافقة بنجاح",
      salesInvoice: updatedInvoice,
    });
  } catch (error) {
    console.error("خطأ في تحديث حالة الموافقة:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء تحديث حالة الموافقة" }, { status: 500 });
  }
};
