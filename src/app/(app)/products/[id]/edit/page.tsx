import { prisma } from "@/lib/prisma";
import ProductEditClientPage from "./-components/product-edit-client-page";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      batches: {
        include: {
          salesItems: {
            include: {
              salesInvoice: true,
            },
          },
          purchaseItem: {
            include: {
              purchaseInvoice: {
                include: {
                  Buyer: true,
                  supplier: true,
                },
              },
            },
          },
          vehicle: true,
        },
      },
      purchaseItems: {
        include: {
          purchaseInvoice: {
            include: {
              Buyer: true,
              supplier: true,
              items: true,
            },
          },
          batch: true,
        },
      },
      salesItems: {
        include: {
          salesInvoice: true,
          batch: true,
        },
      },
    },
  });
  if (!product) return notFound();
  return <ProductEditClientPage product={JSON.parse(JSON.stringify(product))} />;
} 