import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { productId, batchId, salesInvoiceId, soldQuantity, unitPrice } = await req.json();
    if (!productId || !batchId || !salesInvoiceId || !soldQuantity) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    const item = await prisma.salesInvoiceItem.create({
      data: { productId, batchId, salesInvoiceId, soldQuantity, unitPrice },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, soldQuantity, unitPrice } = await req.json();
    if (!id) return NextResponse.json({ error: "معرف العنصر مطلوب" }, { status: 400 });
    const item = await prisma.salesInvoiceItem.update({
      where: { id },
      data: { soldQuantity, unitPrice },
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
    await prisma.salesInvoiceItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 