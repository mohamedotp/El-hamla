import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { productId, purchaseInvoiceId, quantity, purchasePrice } = await req.json();
    if (!productId || !purchaseInvoiceId || !quantity) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    const item = await prisma.purchaseInvoiceItem.create({
      data: { productId, purchaseInvoiceId, quantity, purchasePrice },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, quantity, purchasePrice } = await req.json();
    if (!id) return NextResponse.json({ error: "معرف العنصر مطلوب" }, { status: 400 });
    const item = await prisma.purchaseInvoiceItem.update({
      where: { id },
      data: { quantity, purchasePrice },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "معرف العنصر مطلوب" }, { status: 400 });
    await prisma.purchaseInvoiceItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 