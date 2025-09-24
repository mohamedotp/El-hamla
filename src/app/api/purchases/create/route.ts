import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { routeHandlerWrapper } from "@/lib/route-handler-wrapper";
import { jwtVerify } from "jose";

interface JwtPayloadData {
  data?: {
    id?: string;
    username?: string;
    role?: string;
  };
}

function generateBatchNumber(): string {
  return "BN-" + Date.now();
}

async function getUserIdFromJWT(req: NextRequest): Promise<string | undefined> {
  const outSiteJWT = req.cookies.get("OutSiteJWT");
  if (!outSiteJWT) return undefined;

  try {
    const { payload } = await jwtVerify<JwtPayloadData>(
      outSiteJWT.value,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );

    return payload?.data?.id;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return undefined;
  }
}

export const POST = routeHandlerWrapper(async (req: NextRequest) => {
  const data = await req.json();

  // تحقق من JWT واستخراج userId
  const userId = await getUserIdFromJWT(req);
  if (!userId) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  // التحقق من البيانات الأساسية
  if (!data.supplierId || !data.date || !Array.isArray(data.items) || data.items.length === 0) {
    return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });
  }

  try {
    // إنشاء فاتورة الشراء
    const purchaseInvoice = await prisma.purchaseInvoice.create({
      data: {
        date: new Date(data.date),
        supplierId: data.supplierId,
        userId,
        buyerId: data.buyerId || undefined,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            isReserved: !!item.vehicleId,
            vehicleId: item.vehicleId || undefined,
            isDelivered: item.isDelivered ?? false,   
            deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : undefined,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // إنشاء batch وربطها بكل عنصر
    await Promise.all(
      purchaseInvoice.items.map(async (item) => {
        const batch = await prisma.productBatch.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            purchaseItemId: item.id,
            vehicleId: item.vehicleId || undefined,
            
            batchNumber: generateBatchNumber(),
          },
        });

        await prisma.purchaseInvoiceItem.update({
          where: { id: item.id },
          data: { batchId: batch.id },
        });
      })
    );

    return NextResponse.json({ success: true, purchaseInvoice });
  } catch (error) {
    console.error("Error creating purchase invoice:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء فاتورة المشتريات" },
      { status: 500 }
    );
  }
});
