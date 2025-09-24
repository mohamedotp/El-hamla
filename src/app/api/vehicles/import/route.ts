import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const vehicles = await req.json();
    if (!Array.isArray(vehicles)) {
      return NextResponse.json({ error: "البيانات المرسلة غير صحيحة" }, { status: 400 });
    }


    
    const results = [];
    for (const [i, v] of vehicles.entries()) {
      // تنظيف وتجهيز البيانات
      const data: any = {
        Government_number: v.Government_number,
        royal_number: v.royal_number ? String(v.royal_number) : undefined,
        name: v.type || "سيارة بدون اسم",
        shape: v.shape || undefined,
        model: v.model ? String(v.model) : undefined,
        address: v.receivingParty || v.address || undefined,
        work_kind: "Without_a_work_order",
      };
      try {
        const created = await prisma.vehicle.create({ data });
        results.push({ index: i, success: true, id: created.id });
      } catch (error: any) {
        let message = error?.code === "P2002"
          ? "رقم السيارة مكرر"
          : error?.message || "خطأ غير معروف";
        results.push({ index: i, success: false, error: message });
      }
    }
    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: "فشل في استيراد البيانات", details: error?.message }, { status: 500 });
  }
} 