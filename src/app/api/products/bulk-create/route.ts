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

    // تحقق من الأسماء المكررة
    const names = validProducts.map(p => p.name.trim());
    const existing = await prisma.product.findMany({
      where: { name: { in: names } },
      select: { name: true },
    });

    const existingNames = existing.map(e => e.name);
    if (existingNames.length > 0) {
      return NextResponse.json(
        { message: `بعض الأسماء موجودة مسبقاً: ${existingNames.join(", ")}` },
        { status: 409 }
      );
    }

    // إضافة المنتجات واحدة واحدة حتى نستطيع إرجاع الـ id
    const createdProducts = [];
    for (const product of validProducts) {
      const created = await prisma.product.create({
        data: product,
        select: {
          id: true,
          name: true,
          barcode: true,
          category: true,
          unit: true,
          receivingParty: true,
        },
      });
      createdProducts.push(created);
    }

    return NextResponse.json({ success: true, products: createdProducts }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء إنشاء المنتجات" }, { status: 500 });
  }
}
