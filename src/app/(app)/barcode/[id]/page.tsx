import { getPurchaseWithProducts } from "@/queries/barcode";
import BarcodeList from "@/features/barcode/barcode"; // Client Component

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}
// interface Product {
//   id: string;
//   productId: string;
//   name?: string; // خليها اختيارية
//   // الحقول الأخرى حسب حاجتك
// }

export default async function BarcodePage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    return <div>لم يتم تحديد رقم الفاتورة</div>;
  }
  const purchase = await getPurchaseWithProducts(id);

  if (!purchase) return <div>لم يتم العثور على الفاتورة</div>;

  return <BarcodeList purchase={purchase} />;
}
