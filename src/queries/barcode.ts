// /actions/purchase.ts

import {prisma} from "@/lib/prisma"; // تأكد من مكان تعريف اتصال Prisma في مشروعك

export async function getPurchaseWithProducts(id: string) {
  const purchase = await prisma.purchaseInvoice.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true, // هنا بتضمّن بيانات المنتج كاملة، من ضمنها الاسم
        }
      }
    }
  });

  if (!purchase) return null;

  return {
    ...purchase,
    items: purchase.items.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      barcode: item.product.barcode, // اسحب الاسم من المنتج المرتبط
      quantity: item.quantity,
      purchaseInvoiceId: item.purchaseInvoiceId,
      purchasePrice: item.purchasePrice,
      isReserved: item.isReserved,
      batchId: item.batchId,
      vehicleId: item.vehicleId,
    })),
  };
}
