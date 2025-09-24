// المسار: /app/api/products/check-names/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const names = body.names as string[];

  if (!Array.isArray(names)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const duplicates = await prisma.product.findMany({
    where: { name: { in: names } },
    select: { name: true },
  });

  return NextResponse.json({ duplicates: duplicates.map(d => d.name) });
}
