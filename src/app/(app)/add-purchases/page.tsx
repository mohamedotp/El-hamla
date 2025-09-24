
import { CreatePurchasePageEnhanced } from "@/features/purchase/create/create-purchase-page-enhanced";
import { prisma } from "@/lib/prisma";

export default async function addPurchasesPage() {
  const buyers = await prisma.buyer.findMany();
  const suppliers = await prisma.supplier.findMany();

  return (
    <div className="w-full">
      <CreatePurchasePageEnhanced
        buyers={buyers.map((buyer) => ({ value: buyer.id, label: buyer.name }))}
        suppliers={suppliers.map((supplier) => ({
          value: supplier.id,
          label: supplier.name,
        }))}
      />
    </div>
  );
}
