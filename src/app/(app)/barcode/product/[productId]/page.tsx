import {prisma} from "@/lib/prisma";
import { notFound } from "next/navigation";
import SingleProductBarcodePage from "@/features/barcode/single-product-barcode";

export default async function Page({ params }: { params: { productId: string } }) {
  const product = await prisma.product.findUnique({
    where: {
      id: params.productId,
    },
  });

  if (!product) {
    notFound();
  }

  // The barcode component expects an object with `id`, `name`, and `productId` (for the barcode value)
  const productForBarcode = {
      id: product.id,
      name: product.name,
      productId: product.barcode, // Assuming `barcode` field exists and holds the value
  }

  return <SingleProductBarcodePage product={productForBarcode} />;
} 