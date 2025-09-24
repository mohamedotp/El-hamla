import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { productId, quantity, price, batchNumber } = await req.json();
    if (!productId || !quantity) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    const batch = await prisma.productBatch.create({
      data: { productId, quantity, price, batchNumber },
    });
    return NextResponse.json(batch);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, quantity, price, batchNumber } = await req.json();
    if (!id) return NextResponse.json({ error: "معرف الدفعة مطلوب" }, { status: 400 });
    const batch = await prisma.productBatch.update({
      where: { id },
      data: { quantity, price, batchNumber },
    });
    return NextResponse.json(batch);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "معرف الدفعة مطلوب" }, { status: 400 });
    await prisma.productBatch.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 