// /app/api/products/batch-create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const productSchema = z.object({
  barcode: z.string(),
  name: z.string(),
  category: z.enum([
    "sparePart",
    "rawMaterials",
    "meter",
    "doku",
    "liquids",
    "oil",
    "oilOffice",
  ]),
  unit: z.enum(["kilo", "box", "piece", "liter", "gram", "meter", "reel"]),
  receivingParty: z.enum([
    "vehiclesDepartment",
    "thirdParties",
    "campaignWithJobOrder",
    "campaignWithoutJobOrder",
    "boxMaterials",
    "warehouseReserve",
    "campaignMaterials",
  ]),
  quantity: z.number().int().min(1),
  price: z.number().positive(), // أضف هذا السطر

});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = z.array(productSchema).safeParse(body);
    console.log(body); // ✅ دا اللي جاي فعلاً من req.json()

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors }, { status: 400 });
    }

    const createdProducts = await Promise.all(
      result.data.map(async (product) => {
        const created = await prisma.product.create({
          data: {
            name: product.name,
            barcode: product.barcode,
            category: product.category,
            unit: product.unit,
            receivingParty: product.receivingParty,
      

          },
        });
        console.log("Creating product batch for:", created.id);

        await prisma.productBatch.create({
          data: {
            productId: created.id,
            quantity: product.quantity,
            soldQuantity: 0,
            price: product.price, 
            purchaseItemId: null,
          },
        });
        console.log("✅ Created product batch");

        return created;
      })
    );

    return NextResponse.json({ success: true, data: createdProducts });
  } catch (error) {
    console.error("Error creating products:", JSON.stringify(error, null, 2));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
