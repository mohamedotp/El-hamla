"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function EditInvoiceClient({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isDisbursed = invoice?.disbursementStatus === "Disbursed";

  useEffect(() => {
    const fetchInvoice = async () => {
      const res = await axios.get<any>(`/api/sales-invoices/${invoiceId}`);
      setInvoice(res.data);
      setItems(res.data.items);
    };
    fetchInvoice();
  }, [invoiceId]);

  const handleSearch = async () => {
    const res = await axios.post<any>("/api/products/search", {
      query: searchQuery,
    });
    setSearchResults(res.data);
  };

  const handleAddProduct = (product: any) => {
    if (isDisbursed) return;
    const newItem = {
      product: product,
      productId: product.id,
      batch: { id: "" },
      batchId: "",
      soldQuantity: 1,
      unitPrice: product.price ?? 0,
    };
    setItems([...items, newItem]);
    setIsDialogOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleQuantityChange = (index: number, value: number) => {
    if (isDisbursed) return;

    const availableQuantity = items[index]?.product?.availableQuantity ?? Infinity;

    if (value > availableQuantity) {
      alert(`لا يمكن صرف ${value} وحدة. المتاح في المخزون فقط: ${availableQuantity} وحدة.`);
      return;
    }

    const updatedItems = [...items];
    updatedItems[index].soldQuantity = value;
    setItems(updatedItems);
  };

  const handlePriceChange = (index: number, value: number) => {
    if (isDisbursed) return;
    const updatedItems = [...items];
    updatedItems[index].unitPrice = value;
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    if (isDisbursed) return;
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/sales-invoices/${invoiceId}/edit`, {
        ...invoice,
        items,
      });
      alert("تم حفظ التعديلات بنجاح");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  if (!invoice) return <div>جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">تعديل الفاتورة</h2>

      {/* بيانات الفاتورة */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>رقم السيارة </Label>
          <Input disabled value={invoice.vehicle?.Government_number || ""} />
        </div>
        <div>
          <Label>الجهة </Label>
          <Input disabled value={invoice.vehicle?.address || ""} />
        </div>
        <div>
          <Label>نوع السيارة</Label>
          <Input disabled value={invoice.vehicle?.name || ""} />
        </div>
        <div>
          <Label>تاريخ الفاتورة</Label>
          <Input disabled value={new Date(invoice.date).toLocaleDateString()} />
        </div>
        <div>
          <Label>حالة الصرف</Label>
          <Input
            disabled
            value={
              invoice.disbursementStatus === "Disbursed"
                ? "تم الصرف"
                : "لم يتم الصرف"
            }
          />
        </div>
        <div>
          <Label>حالة الموافقة</Label>
          <Input
            disabled
            value={
              invoice.approvalStatus === "Approved"
                ? "تمت الموافقة"
                : "لم تتم الموافقة"
            }
          />
        </div>
      </div>

      {/* أصناف الفاتورة */}
      <div>
        <Label>أصناف الفاتورة</Label>
        <table className="w-full mt-4 border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100 text-right">
              <th className="p-2">المنتج</th>
              <th className="p-2">الكمية</th>
              <th className="p-2">المتاح</th>
              <th className="p-2">السعر</th>
              <th className="p-2">الإجمالي</th>
              <th className="p-2">حذف</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{item.product?.name || "منتج جديد"}</td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={item.soldQuantity}
                    onChange={(e) =>
                      handleQuantityChange(index, Number(e.target.value))
                    }
                  />
                </td>
                <td className="p-2 text-sm text-gray-500">
                  {item.product?.availableQuantity ?? "?"}
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handlePriceChange(index, Number(e.target.value))
                    }
                  />
                </td>
                <td className="p-2 text-right">
                  {item.soldQuantity * item.unitPrice} ج.م
                </td>
                <td className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* زر + Dialog */}
        {!isDisbursed && (
          <div className="mt-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">+ إضافة منتج جديد</Button>
              </DialogTrigger>
              <DialogContent className="w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogTitle>إضافة منتج جديد</DialogTitle>
                <Label className="mt-2 block">ابحث عن المنتج</Label>
                <Input
                  placeholder="ادخل اسم المنتج"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button className="mt-2" onClick={handleSearch}>
                  بحث
                </Button>
                <div className="mt-4 space-y-2">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => handleAddProduct(product)}
                    >
                      {product.name} - المتاح: {product.availableQuantity ?? "?"}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        {!isDisbursed && (
          <Button
            onClick={handleSave}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            حفظ التعديلات
          </Button>
        )}
      </div>
    </div>
  );
}
