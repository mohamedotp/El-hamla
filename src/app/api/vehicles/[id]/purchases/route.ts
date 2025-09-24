import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ObjectId } from "mongodb"; // 👈 الاستيراد المهم

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleId = params.id;

  
// تأكد أن الـ id صالح
if (!ObjectId.isValid(vehicleId)) {
  return NextResponse.json(
    { error: "معرف السيارة غير صالح" },
    { status: 400 }
  );
}

// لا حاجة لتحويله إلى ObjectId
// const vehicleObjectId = new ObjectId(vehicleId);

const purchases = await prisma.purchaseInvoice.findMany({
  where: {
    items: {
      some: {
        vehicleId: vehicleId // ✅ استخدم string مباشرة
      }
    }
  },
  include: {
    supplier: {
      select: {
        name: true
      },
    },
    Buyer: {
      select: {
        name: true
      },
    },
    items: {
      where: {
        vehicleId: vehicleId // ✅ نفس الشيء هنا
      },
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    }
  },
  orderBy: {
    date: 'desc'
  }
});
    // تحويل البيانات إلى تنسيق مسطح لكل منتج
    const formattedPurchases = purchases.flatMap(purchase => 
      purchase.items.map(item => ({
        id: `${purchase.id}-${item.id}`,
        purchaseId: purchase.id,
        date: purchase.date,
        supplierName: purchase.supplier?.name || 'غير محدد',
        productName: item.product?.name || 'غير محدد',
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        BuyerName: purchase.Buyer?.name || 'غير محدد',
      }))
    );

    return NextResponse.json(formattedPurchases);
  } catch (error) {
    console.error("Error fetching vehicle purchases:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب بيانات المشتريات" },
      { status: 500 }
    );
  }
}
