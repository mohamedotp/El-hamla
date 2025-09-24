import { prisma } from "@/lib/prisma";

export async function searchProducts(searchTerm: string) {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { barcode: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    take: 10,
  });

  return products;
}

export async function getProductById(id: string) {
  if (!id) {
    return null;
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });

  return product;
}