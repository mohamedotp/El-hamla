"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash } from "@phosphor-icons/react/dist/ssr";
import { Printer } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function ClientProductsPage() {
  const router = useRouter();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [query, setQuery] = useState(() => searchParams?.get("query") || "");
  const [page, setPage] = useState(() => Number(searchParams?.get("page")) || 1);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);
  const [invoicesData, setInvoicesData] = useState<any>(null);
  const [selectedPurchaseInvoices, setSelectedPurchaseInvoices] = useState<string[]>([]);
  const [selectedSalesInvoices, setSelectedSalesInvoices] = useState<string[]>([]);
  const [isRemovingFromInvoices, setIsRemovingFromInvoices] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    // استرجاع معلومات المستخدم من التخزين المحلي
    const userInfoStr = localStorage.getItem('userInfo');
    
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUserRole(userInfo.role);
      } catch (error) {
        console.error('خطأ في تحليل معلومات المستخدم:', error);
      }
    }
  }, []);

  const fetchProducts = async () => {
    const res = await fetch(
      `/api/products?page=${page}&pageSize=${pageSize}&query=${query}`
    );
    const data = await res.json();
    setProducts(data.products);
    setTotal(data.total);
  };

  const translate = (
    key: string | undefined,
    type: "unit" | "category" | "receivingParty"
  ): string => {
    const translations: Record<
      "unit" | "category" | "receivingParty",
      Record<string, string>
    > = {
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

    return translations[type][key] || key;
  };

  const deleteProduct = async (id: string) => {
    try {
      setIsCheckingUsage(true);
      
      // التحقق من وجود المنتج في فواتير المشتريات أو المبيعات
      const checkRes = await fetch(`/api/products/${id}/check-usage`);
      const checkData = await checkRes.json();
      
      setUsageInfo(checkData);
      setIsCheckingUsage(false);
      
      // إذا كان المنتج مستخدم، جلب تفاصيل الفواتير
      if (checkData.hasUsage) {
        await fetchInvoicesData(id);
        return;
      }

      // إذا لم يكن مستخدم، احذفه مباشرة
      await performDelete(id);
    } catch (error) {
      console.error("خطأ في التحقق من استخدام المنتج:", error);
      toast.error("خطأ في التحقق من استخدام المنتج");
      setIsCheckingUsage(false);
    }
  };

  const performDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchProducts();
        toast.success("تم حذف المنتج بنجاح");
        setProductToDelete(null);
        setUsageInfo(null);
      } else {
        const data = await res.json();
        const errorMsg = data?.error || "فشل حذف المنتج";
        toast.error(errorMsg);
        console.error("فشل حذف المنتج:", data);
      }
    } catch (error) {
      console.error("خطأ في حذف المنتج:", error);
      toast.error("خطأ في حذف المنتج");
    }
  };

  const fetchInvoicesData = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/invoices`);
      const data = await res.json();
      setInvoicesData(data);
    } catch (error) {
      console.error("خطأ في جلب تفاصيل الفواتير:", error);
      toast.error("خطأ في جلب تفاصيل الفواتير");
    }
  };

  const removeFromSelectedInvoices = async () => {
    if (!productToDelete) return;
    
    setIsRemovingFromInvoices(true);
    
    try {
      let deletedFromPurchase = 0;
      let deletedFromSales = 0;
      let deletedInvoices = 0;
      
      // حذف من فواتير المشتريات المحددة
      for (const invoiceId of selectedPurchaseInvoices) {
        const res = await fetch(`/api/products/${productToDelete.id}/remove-from-purchase?purchaseInvoiceId=${invoiceId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          deletedFromPurchase++;
          if (data.invoiceDeleted) deletedInvoices++;
        }
      }
      
      // حذف من فواتير المبيعات المحددة
      for (const invoiceId of selectedSalesInvoices) {
        const res = await fetch(`/api/products/${productToDelete.id}/remove-from-sales?salesInvoiceId=${invoiceId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          deletedFromSales++;
          if (data.invoiceDeleted) deletedInvoices++;
        }
      }
      
      let message = `تم حذف المنتج من ${deletedFromPurchase} فاتورة مشتريات و ${deletedFromSales} فاتورة مبيعات بنجاح`;
      if (deletedInvoices > 0) {
        message += `. تم حذف ${deletedInvoices} فاتورة فارغة بالكامل`;
      }
      
      toast.success(message);
      
      // إعادة فحص الاستخدام
      await deleteProduct(productToDelete.id);
      
    } catch (error) {
      console.error("خطأ في حذف المنتج من الفواتير:", error);
      toast.error("خطأ في حذف المنتج من الفواتير");
    } finally {
      setIsRemovingFromInvoices(false);
    }
  };

  const printBarcode = (product: any) => {
    // التحقق من وجود باركود للمنتج
    if (!product.barcode) {
      toast.error("هذا المنتج لا يحتوي على باركود");
      return;
    }

    // فتح نافذة جديدة لطباعة الباركود
    const barcodeWindow = window.open(
      `/barcode/product/${product.id}`,
      '_blank',
      'width=400,height=300'
    );
    
    if (barcodeWindow) {
      // انتظار تحميل الصفحة ثم طباعة
      barcodeWindow.onload = () => {
        setTimeout(() => {
          barcodeWindow.print();
        }, 500);
      };
    } else {
      toast.error("فشل في فتح نافذة الطباعة");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, query]);

  // تحديث الـ URL عند تغيير البحث أو الصفحة
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("query", query);
      params.set("page", String(page));
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [query, page]);

  // تحميل معلومات الاستخدام عند تحديد منتج للحذف
  useEffect(() => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
    }
  }, [productToDelete]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">قائمة المنتجات</h1>
      </div>

      <Input
        placeholder="بحث باسم المنتج..."
        value={query}
        onChange={(e) => {
          setPage(1);
          setQuery(e.target.value);
        }}
        className="w-full max-w-sm"
      />

      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">الباركود</TableHead>
              <TableHead className="text-right">الكمية والسعر </TableHead>
              <TableHead className="text-right">الوحدة</TableHead>
              <TableHead className="text-right">التصنيف</TableHead>
              <TableHead className="text-right">جهة الاستلام</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell className="font-mono text-sm">
                  {product.barcode || <span className="text-gray-400">غير محدد</span>}
                </TableCell>
                <TableCell>
                  {product.availableBatches && product.availableBatches.length > 0 ? (
                    <div className="space-y-1">
                      {product.availableBatches.map((batch: any, index: number) => (
                        <div key={batch.id} className="text-sm">
                          <span className="font-medium">
                            {batch.availableQuantity} {translate(product.unit, "unit")}
                          </span>
                          <span className="text-gray-600 mx-1">-</span>
                          <span className="text-green-600 font-semibold">
                            {batch.price?.toLocaleString()} ج.م
                          </span>
                          {batch.batchNumber && (
                            <span className="text-xs text-gray-500 mr-1">
                              (دفعة {batch.batchNumber})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">غير متوفر</span>
                  )}
                </TableCell>
                <TableCell>{translate(product.unit, "unit")}</TableCell>
                <TableCell>{translate(product.category, "category")}</TableCell>
                <TableCell>
                  {translate(product.receivingParty, "receivingParty")}
                </TableCell>
                <TableCell>
                  {product.purchaseItems?.length > 0 ? (
                    <div className="text-gray-700 font-medium space-y-1">
                      {product.purchaseItems.map((item: any, i: number) => (
                        <p key={item.id || i}>
                          {item.vehicle?.name ||
                            item.vehicle?.Government_number ||
                            "غير معروف"}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-600 font-medium">غير محجوز</span>
                  )}
                </TableCell>
                <TableCell className="flex gap-2">
                  {userRole === "admin" && (
                    <>
                      <Link href={`/products/${product.id}/edit?query=${query}&page=${page}`}>
                        <Button variant="outline" size="sm">
                          تعديل
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setProductToDelete(product)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          </AlertDialogHeader>
                          <div className="px-6 py-4">
                            {usageInfo?.hasUsage ? (
                              <div className="space-y-4">
                                <div className="font-medium text-red-600">
                                  ⚠️ تحذير: هذا المنتج موجود في فواتير. اختر الفواتير التي تريد حذف المنتج منها:
                                </div>
                                
                                {/* فواتير المشتريات */}
                                {invoicesData?.purchaseInvoices && invoicesData.purchaseInvoices.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <h4 className="font-medium text-gray-800">فواتير المشتريات:</h4>
                                      <div className="space-x-2 space-x-reverse">
                                        <button
                                          type="button"
                                          onClick={() => setSelectedPurchaseInvoices(invoicesData.purchaseInvoices.map((inv: any) => inv.id))}
                                          className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                          تحديد الكل
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedPurchaseInvoices([])}
                                          className="text-xs text-gray-600 hover:text-gray-800"
                                        >
                                          إلغاء التحديد
                                        </button>
                                      </div>
                                    </div>
                                    <div className="max-h-32 overflow-y-auto space-y-2">
                                      {invoicesData.purchaseInvoices.map((invoice: any) => (
                                        <label key={invoice.id} className="flex items-center space-x-2 space-x-reverse">
                                          <input
                                            type="checkbox"
                                            checked={selectedPurchaseInvoices.includes(invoice.id)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setSelectedPurchaseInvoices([...selectedPurchaseInvoices, invoice.id]);
                                              } else {
                                                setSelectedPurchaseInvoices(selectedPurchaseInvoices.filter(id => id !== invoice.id));
                                              }
                                            }}
                                            className="rounded"
                                          />
                                          <span className="text-sm">
                                            فاتورة {invoice.id} - {new Date(invoice.date).toLocaleDateString()} - 
                                            المورد: {invoice.supplier} - الكمية: {invoice.quantity}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* فواتير المبيعات */}
                                {invoicesData?.salesInvoices && invoicesData.salesInvoices.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <h4 className="font-medium text-gray-800">فواتير المبيعات:</h4>
                                      <div className="space-x-2 space-x-reverse">
                                        <button
                                          type="button"
                                          onClick={() => setSelectedSalesInvoices(invoicesData.salesInvoices.map((inv: any) => inv.id))}
                                          className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                          تحديد الكل
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedSalesInvoices([])}
                                          className="text-xs text-gray-600 hover:text-gray-800"
                                        >
                                          إلغاء التحديد
                                        </button>
                                      </div>
                                    </div>
                                    <div className="max-h-32 overflow-y-auto space-y-2">
                                      {invoicesData.salesInvoices.map((invoice: any) => (
                                        <label key={invoice.id} className="flex items-center space-x-2 space-x-reverse">
                                          <input
                                            type="checkbox"
                                            checked={selectedSalesInvoices.includes(invoice.id)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setSelectedSalesInvoices([...selectedSalesInvoices, invoice.id]);
                                              } else {
                                                setSelectedSalesInvoices(selectedSalesInvoices.filter(id => id !== invoice.id));
                                              }
                                            }}
                                            className="rounded"
                                          />
                                          <span className="text-sm">
                                            فاتورة {invoice.id} - {new Date(invoice.date).toLocaleDateString()} - 
                                            السيارة: {invoice.vehicle} - الكمية: {invoice.quantity}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="text-sm text-gray-600 mt-3">
                                  سيتم حذف المنتج من الفواتير المحددة فقط. إذا كانت الفاتورة تحتوي على منتجات أخرى، ستظل الفاتورة موجودة مع المنتجات الأخرى.
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600">
                                هل أنت متأكد من رغبتك في حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
                              </div>
                            )}
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel 
                              onClick={() => {
                                setProductToDelete(null);
                                setUsageInfo(null);
                                setInvoicesData(null);
                                setSelectedPurchaseInvoices([]);
                                setSelectedSalesInvoices([]);
                              }}
                            >
                              إلغاء
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => {
                                if (usageInfo?.hasUsage) {
                                  // إذا كان المنتج مستخدم، احذفه من الفواتير المحددة أولاً
                                  removeFromSelectedInvoices();
                                } else {
                                  // إذا لم يكن مستخدم، احذفه مباشرة
                                  if (productToDelete) {
                                    performDelete(productToDelete.id);
                                  }
                                }
                              }}
                              disabled={isCheckingUsage || isRemovingFromInvoices}
                            >
                              {isCheckingUsage ? "جاري التحقق..." : 
                               isRemovingFromInvoices ? "جاري الحذف..." :
                               usageInfo?.hasUsage ? "حذف من الفواتير المحددة" : "حذف"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  <Link href={`/products/${product.id}?query=${query}&page=${page}`}>
                    <Button variant="outline" size="sm">
                      تفاصيل
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => printBarcode(product)}
                    className="flex items-center gap-1"
                    disabled={!product.barcode}
                    title={!product.barcode ? "لا يوجد باركود لهذا المنتج" : "طباعة الباركود"}
                  >
                    <Printer className="h-4 w-4" />
                    طباعة
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          السابق
        </Button>
        <span>
          الصفحة {page} من {Math.ceil(total / pageSize)}
        </span>
        <Button
          disabled={page * pageSize >= total}
          onClick={() => setPage(page + 1)}
        >
          التالي
        </Button>
      </div>
    </div>

  );
}
