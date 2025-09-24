import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { routeHandlerWrapper } from "@/lib/route-handler-wrapper";

// حذف فاتورة المشتريات
export const DELETE = routeHandlerWrapper(
  async (req: NextRequest, context: { params: { [key: string]: string } }) => {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json(
        { error: "معرف الفاتورة مطلوب" },
        { status: 400 },
      );
    }

    try {
      // التحقق من وجود الفاتورة أولاً
      const invoice = await prisma.purchaseInvoice.findUnique({
        where: { id },
        include: { 
          items: {
            include: {
              batch: true
            }
          } 
        },
      });

      if (!invoice) {
        return NextResponse.json(
          { error: "فاتورة المشتريات غير موجودة" },
          { status: 404 },
        );
      }

      console.log(`Deleting invoice ${id} with ${invoice.items.length} items`);

      // حذف البيانات بالترتيب الصحيح لتجنب مشاكل الـ foreign key constraints
      
      // 1. حذف الـ batches المرتبطة بالعناصر
      const itemIds = invoice.items.map(item => item.id);
      if (itemIds.length > 0) {
        console.log(`Deleting ${itemIds.length} batches`);
        await prisma.productBatch.deleteMany({
          where: {
            purchaseItemId: {
              in: itemIds,
            },
          },
        });
      }

      // 2. حذف عناصر الفاتورة
      console.log(`Deleting ${invoice.items.length} invoice items`);
      await prisma.purchaseInvoiceItem.deleteMany({
        where: {
          purchaseInvoiceId: id,
        },
      });

      // 3. حذف الفاتورة نفسها
      console.log(`Deleting invoice ${id}`);
      await prisma.purchaseInvoice.delete({
        where: { id },
      });

      console.log(`Successfully deleted invoice ${id}`);

      return NextResponse.json({ 
        message: "تم حذف فاتورة المشتريات بنجاح",
        deletedInvoiceId: id 
      });
    } catch (error) {
      console.error("Error deleting purchase invoice:", error);
      return NextResponse.json(
        { error: "حدث خطأ أثناء حذف فاتورة المشتريات" },
        { status: 500 },
      );
    }
  },
);

// تحديث فاتورة المشتريات
export const PUT = routeHandlerWrapper(
  async (req: NextRequest, context: { params: { [key: string]: string } }) => {
    const { id } = context.params;
    const data = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "معرف الفاتورة مطلوب" },
        { status: 400 },
      );
    }

    if (
      !data.supplierId ||
      !data.date ||
      !data.items ||
      data.items.length === 0
    ) {
      return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
    }

    try {
      const existingInvoice = await prisma.purchaseInvoice.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existingInvoice) {
        return NextResponse.json(
          { error: "فاتورة المشتريات غير موجودة" },
          { status: 404 },
        );
      }

      await prisma.productBatch.deleteMany({
        where: {
          purchaseItemId: {
            in: existingInvoice.items.map((item) => item.id),
          },
        },
      });

      await prisma.purchaseInvoiceItem.deleteMany({
        where: {
          purchaseInvoiceId: id,
        },
      });

      const updatedInvoice = await prisma.purchaseInvoice.update({
        where: { id },
        data: {
          date: new Date(data.date),
          supplierId: data.supplierId,
          buyerId: data.buyerId || undefined,
          items: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              purchasePrice: item.purchasePrice,
              isReserved: !!item.vehicleId,
              vehicleId: item.vehicleId || undefined,
              isDelivered: item.isDelivered || false,
              deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : undefined,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      await Promise.all(
        updatedInvoice.items.map(async (item) => {
          const batch = await prisma.productBatch.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              purchaseItemId: item.id,
              vehicleId: item.vehicleId || undefined,
            },
          });

          await prisma.purchaseInvoiceItem.update({
            where: { id: item.id },
            data: { batchId: batch.id },
          });
        }),
      );

      return NextResponse.json({
        message: "تم تحديث فاتورة المشتريات بنجاح",
        invoice: updatedInvoice,
      });
    } catch (error) {
      console.error("Error updating purchase invoice:", error);
      return NextResponse.json(
        { error: "حدث خطأ أثناء تحديث فاتورة المشتريات" },
        { status: 500 },
      );
    }
  },
);

// جلب فاتورة مشتريات محددة
export const GET = routeHandlerWrapper(
  async (req: NextRequest, context: { params: { [key: string]: string } }) => {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json(
        { error: "معرف الفاتورة مطلوب" },
        { status: 400 },
      );
    }

    try {
      const invoice = await prisma.purchaseInvoice.findUnique({
        where: { id },
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
              batch: true,
            },
          },
        },
      });

      if (!invoice) {
        return NextResponse.json(
          { error: "فاتورة المشتريات غير موجودة" },
          { status: 404 },
        );
      }

      return NextResponse.json(invoice);
    } catch (error) {
      console.error("Error fetching purchase invoice:", error);
      return NextResponse.json(
        { error: "حدث خطأ أثناء جلب فاتورة المشتريات" },
        { status: 500 },
      );
    }
  },
);
