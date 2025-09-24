import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleId = params.id;

    if (!ObjectId.isValid(vehicleId)) {
      return NextResponse.json(
        { error: "معرف السيارة غير صالح" },
        { status: 400 }
      );
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search")?.trim();

    const sales = await prisma.salesInvoice.findMany({
      where: {
        vehicleId: vehicleId,
        approvalStatus: "Approved",          
        disbursementStatus: "Disbursed",    
        ...(search
          ? {
              number: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    

    const formattedSales = sales.flatMap((sale) =>
      sale.items.map((item) => ({
        id: `${sale.id}-${item.id}`,
        saleId: sale.id,
        date: sale.date,
        productName: item.product?.name || "غير محدد",
        quantity: item.soldQuantity,
        unitPrice: item.unitPrice,
        number: sale.number ?? "—",
      }))
    );

    return NextResponse.json(formattedSales);
  } catch (error) {
    console.error("Error fetching vehicle sales:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب بيانات المبيعات" },
      { status: 500 }
    );
  }
}
