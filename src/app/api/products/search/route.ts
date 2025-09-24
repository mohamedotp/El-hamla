import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma"; // أو حسب مسار prisma في مشروعك

// الدالة searchProducts مثل التي كتبتها مع بعض التعديلات الطفيفة لتضمينها هنا مباشرة
async function searchProducts(query: string) {
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    include: {
      batches: {
        select: {
          quantity: true,
        },
      },
      purchaseItems: {
        take: 1,
        include: {
          purchaseInvoice: {
            include: {
              supplier: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    take: 10,
  });

  return products.map((product) => {
    const supplierName = product.purchaseItems[0]?.purchaseInvoice?.supplier?.name || "غير محدد";
    return {
      ...product,
       batchProducts: product.batches,
      supplierName,
    };
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query || query.length < 2) {
      return NextResponse.json(
        { message: "Query parameter 'query' is required and should be at least 2 characters." },
        { status: 400 }
      );
    }

    const products = await searchProducts(query);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error in /api/products/search:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  const { query } = await req.json();

  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    take: 10,
  });

  return NextResponse.json(products);
}
