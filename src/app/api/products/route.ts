// /app/api/products/route.ts

import { prisma } from "@/lib/prisma";
import { Categories } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const query = searchParams.get("query") || "";

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              barcode: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        
        include: {
          batches: {
            where: {
              quantity: {
                gt: 0
              }
            },
            select: {
              id: true,
              quantity: true,
              soldQuantity: true,
              price: true,
              batchNumber: true,
              purchaseItem: {
                select: {
                  purchasePrice: true
                }
              }
            },
          },
          
          purchaseItems: {
            select: {
              purchasePrice: true,
            },
          },      },
        // select: {
        //   receivingParty: true,
        //   unit: true,
        //   category: true,
        // },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ name: "asc" }],
      }),
      prisma.product.count({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              barcode: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        
      }),
    ]);

    const enrichedProducts = products.map((product) => {
      const prices = product.purchaseItems
        .map((item) => item.purchasePrice)
        .filter((price): price is number => price !== null);

      const totalQuantity = product.batches.reduce(
        (acc, batch) => acc + (batch.quantity || 0),
        0
      );

      // تجهيز بيانات الدفعات مع الكميات والأسعار
      const availableBatches = product.batches.map(batch => ({
        id: batch.id,
        quantity: batch.quantity,
        availableQuantity: batch.quantity - batch.soldQuantity,
        price: batch.price || batch.purchaseItem?.purchasePrice || 0,
        batchNumber: batch.batchNumber
      })).filter(batch => batch.availableQuantity > 0);

      return {
        ...product,
        prices,
        totalQuantity,
        availableBatches
      };
    });

    return NextResponse.json({ products: enrichedProducts, total });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "فشل في جلب المنتجات" },
      { status: 500 }
    );
  }
}