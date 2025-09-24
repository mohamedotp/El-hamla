// File: app/api/sales-invoices/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: /api/sales-invoices
export async function GET() {
  try {
    const invoices = await prisma.salesInvoice.findMany({
      where: {
        approvalStatus: "Approved",
      },
      include: {
        vehicle: true,
        repairMan: {
          select: {
            id: true,
            name: true,
            workshopName: true,
          }
        },
        bolRepairMan: true,
        user: true,
        items: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("GET /api/sales-invoices error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
