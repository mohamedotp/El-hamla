// /app/api/purchases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { date, supplierId, userId, buyerId, items } = data;

    const purchase = await prisma.purchaseInvoice.create({
      data: {
        date: new Date(date),
        supplierId,
        userId,
        buyerId,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            isReserved: item.isReserved || false,
            vehicleId: item.vehicleId || null,
            batch: {
              create: {
                productId: item.productId,
                quantity: item.quantity,
                vehicleId: item.vehicleId || null,
              },
            },
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error creating purchase' }, { status: 500 });
  }
}
