import { prisma } from "@/lib/prisma";
import { withValidation } from "@/lib/route-handler-wrapper";
import { NextResponse } from "next/server";
import { object, string } from "yup";

// مخطط التحقق من صحة تحديث حالة فاتورة المبيعات
const updateSalesInvoiceSchema = object({
  repairManId: string().nullable(),
  bolRepairManId: string().nullable(),
  approvalStatus: string().oneOf(["Approved", "Notapproved"]).nullable(),
  disbursementStatus: string().oneOf(["Disbursed", "NotDisbursed"]).nullable(),
});

// الحصول على فاتورة مبيعات محددة
export const GET = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const salesInvoice = await prisma.salesInvoice.findUnique({
      where: { id: params.id },
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
            batch: {
              include: {
                product: true,
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
        },
        user: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });

    if (!salesInvoice) {
      return NextResponse.json(
        { message: "لم يتم العثور على فاتورة المبيعات" },
        { status: 404 }
      );
    }

    return NextResponse.json(salesInvoice);
  } catch (error) {
    console.error("خطأ في استرجاع فاتورة المبيعات:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء استرجاع فاتورة المبيعات" },
      { status: 500 }
    );
  }
};

// تحديث حالة فاتورة المبيعات
export const PATCH = async (req: Request, context: { params: { id: string } }) => {
  const { id } = context.params;
  try {
    const body = await req.json();

    const existingInvoice = await prisma.salesInvoice.findUnique({ where: { id } });
    if (!existingInvoice) {
      return NextResponse.json({ message: "لم يتم العثور على فاتورة المبيعات" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.repairManId !== undefined) updateData.repairManId = body.repairManId;
    if (body.bolRepairManId !== undefined) updateData.bolRepairManId = body.bolRepairManId;
    if (body.disbursementStatus !== undefined) updateData.disbursementStatus = body.disbursementStatus;

    if (
      body.disbursementStatus === "Disbursed" &&
      existingInvoice.disbursementStatus !== "Disbursed"
    ) {
      const invoiceItems = await prisma.salesInvoiceItem.findMany({
        where: { salesInvoiceId: id },
        include: { batch: true },
      });

      for (const item of invoiceItems) {
        await prisma.productBatch.update({
          where: { id: item.batchId },
          data: {
            quantity: { decrement: item.soldQuantity },
            soldQuantity: { increment: item.soldQuantity }, // ✅ تم الإضافة هنا
          },
        });
      }
    }

    const updatedInvoice = await prisma.salesInvoice.update({
      where: { id },
      data: updateData,
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
      message: "تم تحديث فاتورة المبيعات بنجاح",
      salesInvoice: updatedInvoice,
    });
  } catch (error) {
    console.error("خطأ في تحديث فاتورة المبيعات:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء تحديث فاتورة المبيعات" },
      { status: 500 }
    );
  }
};


// حذف فاتورة المبيعات
export const DELETE = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    // التحقق من وجود الفاتورة
    const existingInvoice = await prisma.salesInvoice.findUnique({
      where: { id: params.id },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { message: "لم يتم العثور على فاتورة المبيعات" },
        { status: 404 }
      );
    }

    // حذف عناصر الفاتورة أولاً
    await prisma.salesInvoiceItem.deleteMany({
      where: { salesInvoiceId: params.id },
    });

    // ثم حذف الفاتورة نفسها
    await prisma.salesInvoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "تم حذف فاتورة المبيعات بنجاح",
    });
  } catch (error) {
    console.error("خطأ في حذف فاتورة المبيعات:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء حذف فاتورة المبيعات" },
      { status: 500 }
    );
  }
};