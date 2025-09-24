"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Batch } from "mongodb";
import { Bath } from "lucide-react";

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: "",
    endDate: "",
    invoiceOrBatch: "", 
    type: "all",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    fetch(`/api/products/${id}?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          router.push("/products");
        } else {
          setProduct(data);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>جاري التحميل...</p>;
  if (!product) return <p>المنتج غير موجود</p>;

  const translate = (
    key: string | undefined,
    type: "unit" | "category" | "receivingParty"
  ): string => {
    const translations = {
      unit: {
        kg: "كيلو",
        kilo: "كيلو",
        box: "علبة",
        piece: "قطعة",
        liter: "لتر",
        gram: "جرام",
        meter: "متر",
        reel: "بكرة",
      },
      category: {
        sparePart: "قطعة غيار",
        rawMaterials: "خامات",
        meter: "متر",
        doku: "دوكو",
        liquids: "سوائل",
        oil: "زيوت",
        oilOffice: "مكتب الزيت",
      },
      receivingParty: {
        vehiclesDepartment: "قسم المركبات",
        thirdParties: "جهات خارجية",
        campaignWithJobOrder: "الحملة بأمر شغل",
        campaignWithoutJobOrder: "الحملة بدون أمر شغل",
        boxMaterials: "خامات الصندوق",
        warehouseReserve: "احتياطي مخزن",
        campaignMaterials: "خامات الحملة",
      },
    };
    if (!key) return "غير محدد";
    const dict = translations[type] as Record<string, string>;
    return dict[key] || key;
  };

  const combinedTransactions = (() => {
    const all: any[] = [];

    if (!product.batches || !Array.isArray(product.batches)) {
      return all;
    }

    product.batches.forEach((batch: any) => {
      if (!batch.purchaseItem) {
        return;
      }

      let remaining = batch.purchaseItem.quantity;

      all.push({
        type: "purchase",
        date: batch.purchaseItem.purchaseInvoice?.date,
        invoiceId: batch.purchaseItem.purchaseInvoiceId,
        quantity: batch.purchaseItem.quantity,
        unitPrice: batch.purchaseItem.purchasePrice,
        total: batch.purchaseItem.quantity * batch.purchaseItem.purchasePrice,
        buyer: batch.purchaseItem.purchaseInvoice?.Buyer?.name,
        supplier: batch.purchaseItem.purchaseInvoice?.supplier?.name,
        remainingQuantity: remaining,
        batchNumber: batch.batchNumber,
        batchPrice: batch.price ?? null,
      });

      if (batch.salesItems && Array.isArray(batch.salesItems)) {
        batch.salesItems.forEach((item: any) => {
          remaining -= item.soldQuantity;
          all.push({
            type: "sale",
            date: item.salesInvoice?.date,
            invoiceId: item.salesInvoiceId,
            quantity: item.soldQuantity,
            unitPrice: item.unitPrice,
            total: item.unitPrice * item.soldQuantity,
            vehicle: item.salesInvoice?.vehicle,
            remainingQuantity: remaining,
            batchNumber: batch.batchNumber,
          });
        });
      }
    });

    return all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  })();

  const filteredTransactions = combinedTransactions.filter((t) => {
    const date = new Date(t.date);
    const startDate = filter.startDate ? new Date(filter.startDate) : null;
    const endDate = filter.endDate ? new Date(filter.endDate) : null;
    const searchText = filter.invoiceOrBatch.toLowerCase();
  
    return (
      (!filter.invoiceOrBatch ||
        (t.invoiceId?.toString().toLowerCase().includes(searchText) ||
         t.batchNumber?.toString().toLowerCase().includes(searchText))) &&
      (filter.type === "all" || t.type === filter.type) &&
      (!startDate || date >= startDate) &&
      (!endDate || date <= endDate)
    );
  });
  

  const pageCount = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pageCount) {
      setCurrentPage(page);
    }
  };
console.log(product);
const totalQuantity = (product.batches && Array.isArray(product.batches)) 
  ? product.batches.reduce(
      (sum: number, batch: any) => sum + (batch.quantity || 0),
      0
    )
  : 0;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        <p>التصنيف: {translate(product.category, "category")}</p>
        <p>الوحدة: {translate(product.unit, "unit")}</p>
        <p>
          جهة الاستلام: {translate(product.receivingParty, "receivingParty")}
        </p>
        <p>الكمية المتوافرة: {totalQuantity}</p>
      </div>

      {/* ✅ الفلاتر */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm mb-1">من تاريخ</label>
          <input
            type="date"
            className="border rounded p-2 w-full"
            value={filter.startDate}
            onChange={(e) => {
              setCurrentPage(1);
              setFilter({ ...filter, startDate: e.target.value });
            }}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">إلى تاريخ</label>
          <input
            type="date"
            className="border rounded p-2 w-full"
            value={filter.endDate}
            onChange={(e) => {
              setCurrentPage(1);
              setFilter({ ...filter, endDate: e.target.value });
            }}
          />
        </div>
        <div>
  <label className="block text-sm mb-1">رقم الفاتورة أو الدفعة</label>
  <input
    type="text"
    className="border rounded p-2 w-full"
    placeholder="ابحث برقم الفاتورة أو الدفعة"
    value={filter.invoiceOrBatch}
    onChange={(e) => {
      setCurrentPage(1);
      setFilter({ ...filter, invoiceOrBatch: e.target.value });
    }}
  />
</div>

        <div>
          <label className="block text-sm mb-1">نوع العملية</label>
          <select
            className="border rounded p-2 w-full"
            value={filter.type}
            onChange={(e) => {
              setCurrentPage(1);
              setFilter({ ...filter, type: e.target.value });
            }}
          >
            <option value="all">الكل</option>
            <option value="purchase">شراء</option>
            <option value="sale">بيع</option>
          </select>
        </div>
      </div>

            
      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">جميع الدفعات </h2>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">التاريخ</th>
              <th className="border p-2">النوع</th>
              <th className="border p-2">رقم الفاتورة</th>
              <th className="border p-2">الكمية</th>
              <th className="border p-2">المتبقي</th>
              <th className="border p-2">سعر الوحدة</th>
              <th className="border p-2">الإجمالي</th>
              <th className="border p-2">الدفعة</th>
              <th className="border p-2">تفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((t, i) => (
              <tr
                key={i}
                className={
                  t.type === "purchase" ? "bg-green-50" : "bg-yellow-50"
                }
              >
                <td className="border p-2">
                  {new Date(t.date).toLocaleDateString()}
                </td>
                <td className="border p-2">
                  {t.type === "purchase" ? "شراء" : "بيع"}
                </td>
                <td className="border p-2">{t.invoiceId}</td>
                <td className="border p-2">{t.quantity}</td>
                <td className="border p-2">{t.remainingQuantity}</td>
                <td className="border p-2">{t.unitPrice}</td>
                <td className="border p-2">{t.total}</td>
                <td className="border p-2">{t.batchNumber || "—"}</td>
                <td className="border p-2">
                  {t.type === "purchase"
                    ? `المورد: ${t.supplier || "—"} / الأمين: ${t.buyer || "—"}`
                    : `السيارة: ${t.vehicle?.Government_number || "—"} - ${
                        t.vehicle?.name || "—"
                      }`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          className="px-3 py-1 border rounded"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          السابق
        </button>
        {[...Array(pageCount)].map((_, idx) => (
          <button
            key={idx}
            className={`px-3 py-1 border rounded ${
              currentPage === idx + 1 ? "bg-blue-200" : ""
            }`}
            onClick={() => handlePageChange(idx + 1)}
          >
            {idx + 1}
          </button>
        ))}
        <button
          className="px-3 py-1 border rounded"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === pageCount}
        >
          التالي
        </button>
      </div>
    </div>
  );
}
