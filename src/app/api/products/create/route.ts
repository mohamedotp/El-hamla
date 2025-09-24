// المسار: /app/api/products/bulk-create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Categories, Units, ReceivingParty } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const products = await req.json();

    if (!Array.isArray(products)) {
      return NextResponse.json({ message: "البيانات المرسلة غير صحيحة" }, { status: 400 });
    }

    const validProducts = products.filter((product) => {
      const { name, barcode, category, unit, receivingParty } = product;

      return (
        name &&
        barcode &&
        Object.values(Categories).includes(category) &&
        Object.values(Units).includes(unit) &&
        Object.values(ReceivingParty).includes(receivingParty)
      );
    });

    if (validProducts.length === 0) {
      return NextResponse.json({ message: "لا توجد منتجات صالحة للإدخال" }, { status: 400 });
    }

    const created = await prisma.product.createMany({
      data: validProducts,
    });

    return NextResponse.json({ success: true, count: created.count }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء إنشاء المنتجات" }, { status: 500 });
  }
}
