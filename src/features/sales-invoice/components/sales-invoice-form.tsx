"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { parse } from "cookie";
import { decodeJwt } from "jose"; // أو jwt-decode حسب المكتبة اللي بتستخدمها

interface Vehicle {
  id: string;
  name: string;
  Government_number: string;
  workOrders: WorkOrder[];
}

interface WorkOrder {
  id: string;
  number: string;
  date: string;
}

interface Product {
  id: string;
  name: string;
  barcode: string;
  batches: ProductBatch[];
}
interface purchaseitem {
  id: string;
  purchasePrice: number;
  // باقي الخصائص حسب الحاجة
}
interface ProductBatch {
  id: string;
  quantity: number;
  supplier: string;
  purchaseItem?: purchaseitem; // حرف I كبير هنا
}

interface SalesInvoiceItem {
  id?: string;
  productId: string;
  productName: string;
  batchId: string;
  soldQuantity: number;
  unitPrice: number;
  availableQuantity: number;
  supplier?: string;
}
interface bolRepairMan {
  id: string;
  name: string;
}

interface SalesInvoiceFormProps {
  role: "maintenance" | "admin" | "warehouse";
  mode: "create" | "view" | "edit";
  initialData?: any;
}

export function SalesInvoiceForm({
  role,
  mode,
  initialData,
}: SalesInvoiceFormProps) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<SalesInvoiceItem[]>([]);
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bolRepairMen, setBolRepairMen] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedBolRepairMan, setSelectedBolRepairMan] = useState<
    string | null
  >(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const form = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      vehicleId: "",
      number: "",
      workOrderId: "none",
      totalAmount: 0,
      bolRepairManId: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        date: new Date(initialData.date).toISOString().split("T")[0],
        vehicleId: initialData.vehicleId,
        workOrderId: initialData.workOrderId || "none",
        totalAmount: initialData.totalAmount,
        bolRepairManId: initialData.bolRepairManId,
      });

      if (initialData.items) {
        const items = initialData.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          batchId: item.batchId,
          soldQuantity: item.soldQuantity,
          unitPrice: item.unitPrice,
          availableQuantity: item.availableQuantity,
          supplier: item.batch?.purchaseItem?.purchaseInvoice?.supplier?.name,
        }));
        setInvoiceItems(items);
      }

      if (initialData.vehicle) {
        setSelectedVehicle(initialData.vehicle);
        fetchWorkOrders(initialData.vehicleId);
      }
    }
  }, [initialData, form]);

  useEffect(() => {
    const fetchRepairMen = async () => {
      try {
        const response = await axios.get<bolRepairMan[]>("/api/bolrepairman");
        setBolRepairMen(response.data);
      } catch (error) {
        console.error("خطأ في جلب رجال الصيانة:", error);
        toast.error("حدث خطأ أثناء تحميل أسماء رجال الصيانة");
      }
    };

    fetchRepairMen();
  }, []);

  // البحث عن السيارات
  const searchVehicles = async () => {
    if (vehicleSearchTerm.length < 2) return;
    setIsSearching(true);
    try {
      const response = await axios.get<Vehicle[]>(
        `/api/sales-invoices/search?type=vehicle&term=${vehicleSearchTerm}`
      );
      setVehicles(response.data);
    } catch (error) {
      console.error("خطأ في البحث عن السيارات:", error);
      toast.error("حدث خطأ أثناء البحث عن السيارات");
    } finally {
      setIsSearching(false);
    }
  };

  // البحث عن المنتجات
  const searchProducts = async () => {
    if (productSearchTerm.length < 2) return;
    setIsSearching(true);
    try {
      const response = await axios.get<Product[]>(
        `/api/sales-invoices/search?type=product&term=${productSearchTerm}`
      );
      setProducts(response.data);
    } catch (error) {
      console.error("خطأ في البحث عن المنتجات:", error);
      toast.error("حدث خطأ أثناء البحث عن المنتجات");
    } finally {
      setIsSearching(false);
    }
  };

  // جلب أوامر العمل للسيارة المحددة
  const fetchWorkOrders = async (vehicleId: string) => {
    try {
      const response = await axios.get<WorkOrder[]>(
        `/api/sales-invoices/search?type=workOrder&vehicleId=${vehicleId}`
      );
      setWorkOrders(response.data);
    } catch (error) {
      console.error("خطأ في جلب أوامر العمل:", error);
      toast.error("حدث خطأ أثناء جلب أوامر العمل");
    }
  };

  // اختيار سيارة
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    form.setValue("vehicleId", vehicle.id);
    fetchWorkOrders(vehicle.id);
    setVehicleSearchTerm("");
  };

  // اختيار منتج
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setProductSearchTerm("");
  };

  // اختيار دفعة منتج
  const handleBatchSelect = (product: Product, batch: ProductBatch) => {
    // التحقق من عدم تكرار الدفعة
    const existingItem = invoiceItems.find(item => item.batchId === batch.id);
    if (existingItem) {
      toast.error("هذه الدفعة مضافة بالفعل في الفاتورة");
      return;
    }

    // التحقق من الكمية المتاحة
    if (batch.quantity <= 0) {
      toast.error("لا توجد كمية متاحة في هذه الدفعة");
      return;
    }

    const unitPrice = batch.purchaseItem?.purchasePrice ?? 0;
    const newItem: SalesInvoiceItem = {
      productId: product.id,
      productName: product.name,
      batchId: batch.id,
      soldQuantity: 1,
      unitPrice: unitPrice,
      availableQuantity: batch.quantity,
      supplier: batch.supplier,
    };

    setInvoiceItems([...invoiceItems, newItem]);
    setSelectedProduct(null);
    calculateTotalAmount([...invoiceItems, newItem]);
    toast.success("تم إضافة المنتج بنجاح");
  };

  // تحديث كمية العنصر
  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      toast.error("الكمية يجب أن تكون أكبر من صفر");
      return;
    }

    const item = invoiceItems[index];
    if (quantity > item.availableQuantity) {
      toast.error(`الكمية المطلوبة (${quantity}) أكبر من الكمية المتاحة (${item.availableQuantity})`);
      return;
    }

    const updatedItems = [...invoiceItems];
    updatedItems[index].soldQuantity = quantity;
    setInvoiceItems(updatedItems);
    calculateTotalAmount(updatedItems);
  };

  // تحديث سعر الوحدة
  const updateItemPrice = (index: number, price: number) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index].unitPrice = price;
    setInvoiceItems(updatedItems);
    calculateTotalAmount(updatedItems);
  };

  // حذف عنصر
  const removeItem = (index: number) => {
    const updatedItems = [...invoiceItems];
    updatedItems.splice(index, 1);
    setInvoiceItems(updatedItems);
    calculateTotalAmount(updatedItems);
  };

  // حساب المبلغ الإجمالي
  const calculateTotalAmount = (items: SalesInvoiceItem[]) => {
    const total = items.reduce(
      (sum, item) => sum + item.soldQuantity * item.unitPrice,
      0
    );
    form.setValue("totalAmount", total);
  };

  // إرسال النموذج
// البحث التلقائي عن السيارات عند تغيير الكلمة
useEffect(() => {
  const timeout = setTimeout(() => {
    if (vehicleSearchTerm.length >= 2) {
      searchVehicles();
    }
  }, 400); // تأخير بسيط علشان ما يعملش بحث كل حرف

  return () => clearTimeout(timeout);
}, [vehicleSearchTerm]);

// البحث التلقائي عن المنتجات عند تغيير الكلمة
useEffect(() => {
  const timeout = setTimeout(() => {
    if (productSearchTerm.length >= 2) {
      searchProducts();
    }
  }, 400);

  return () => clearTimeout(timeout);
}, [productSearchTerm]);

  const onSubmit = async (data: any) => {
    if (invoiceItems.length === 0) {
      toast.error("يجب إضافة عنصر واحد على الأقل");
      return;
    }

    // التحقق من الكميات قبل الحفظ
    for (const item of invoiceItems) {
      if (item.soldQuantity <= 0) {
        toast.error(`الكمية المطلوبة للمنتج "${item.productName}" يجب أن تكون أكبر من صفر`);
        return;
      }

      if (item.soldQuantity > item.availableQuantity) {
        toast.error(`الكمية المطلوبة للمنتج "${item.productName}" (${item.soldQuantity}) أكبر من الكمية المتاحة (${item.availableQuantity})`);
        return;
      }
    }

    // التحقق من عدم تكرار الدفعات
    const batchIds = invoiceItems.map(item => item.batchId);
    const uniqueBatchIds = new Set(batchIds);
    if (batchIds.length !== uniqueBatchIds.size) {
      toast.error("يوجد دفعات مكررة في الفاتورة");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const payload = {
        number: data.number,
        date: data.date,
        vehicleId: data.vehicleId,
        workOrderId: data.workOrderId === "none" ? null : data.workOrderId,
        totalAmount: data.totalAmount,
        bolRepairMan: data.repairManId,
        items: invoiceItems.map((item) => ({
          productId: item.productId,
          batchId: item.batchId,
          soldQuantity: item.soldQuantity,
          unitPrice: item.unitPrice,
          availableQuantity: item.availableQuantity,
        })),
      };
  
      console.log("🚀 Payload to send:", payload);
  
      if (mode === "create") {
        await axios.post("/api/sales-invoices", payload, {
          withCredentials: true,
        });
        toast.success("تم إنشاء فاتورة المبيعات بنجاح");
        router.push("/sales-invoices/maintenance");
      } else if (mode === "edit" && initialData) {
        await axios.patch(`/api/sales-invoices/${initialData.id}`, payload, {
          withCredentials: true,
        });
        toast.success("تم تحديث فاتورة المبيعات بنجاح");
        router.push("/sales-invoices/maintenance");
      }
    } catch (error) {
      console.error("❌ خطأ في حفظ فاتورة المبيعات:", error);
      toast.error("حدث خطأ أثناء حفظ فاتورة المبيعات");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // تعطيل الحقول في وضع العرض
  const isDisabled =
    mode === "view" || (role !== "maintenance" && mode === "create");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {mode === "create" && "إنشاء فاتورة مبيعات جديدة"}
          {mode === "view" && "عرض فاتورة مبيعات"}
          {mode === "edit" && "تعديل فاتورة مبيعات"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* التاريخ */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التاريخ</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* رقم الفاتورة */}
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الفاتورة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل رقم الفاتورة"
                        {...field}
                        disabled={isDisabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="bolRepairManId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>بلوكامين الصيانة  </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedBolRepairMan(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر امين الصيانة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bolRepairMen.map((man) => (
                          <SelectItem key={man.id} value={man.id}>
                            {man.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* السيارة */}
              <div className="space-y-2">
                <FormLabel>السيارة</FormLabel>
                {selectedVehicle ? (
                  <div className="flex items-center space-x-2 border p-2 rounded-md">
                    <div className="flex-1">
                      <p className="font-medium">{selectedVehicle.name}</p>
                      <p className="text-sm text-gray-500">
                        رقم حكومي: {selectedVehicle.Government_number}
                      </p>
                    </div>
                    {!isDisabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedVehicle(null);
                          form.setValue("vehicleId", "");
                          form.setValue("workOrderId", "none");
                          setWorkOrders([]);
                        }}
                      >
                        إزالة
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="ابحث عن السيارة بالاسم أو الرقم الحكومي"
                        value={vehicleSearchTerm}
                        onChange={(e) => setVehicleSearchTerm(e.target.value)}
                        disabled={isDisabled}
                      />
                      
                    </div>
                    {isSearching && <p className="text-sm">جاري البحث...</p>}
                    {vehicles.length > 0 && (
                      <div className="border rounded-md max-h-40 overflow-y-auto">
                        {vehicles.map((vehicle) => (
                          <div
                            key={vehicle.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleVehicleSelect(vehicle)}
                          >
                            <p className="font-medium">{vehicle.name}</p>
                            <p className="text-sm text-gray-500">
                              رقم حكومي: {vehicle.Government_number}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* أمر العمل */}
              {selectedVehicle && (
                <FormField
                  control={form.control}
                  name="workOrderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>أمر العمل</FormLabel>
                      <Select
                        disabled={isDisabled}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر أمر العمل" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">بدون امر شغل</SelectItem>
                          {workOrders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              {order.number} -{" "}
                              {new Date(order.date).toLocaleDateString("ar-EG")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* المبلغ الإجمالي */}
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المبلغ الإجمالي</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        disabled={true}
                        value={field.value.toFixed(2) || 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* إضافة منتجات */}
            {!isDisabled && (
              <div className="space-y-4 border p-4 rounded-md">
                <h3 className="text-lg font-medium">إضافة منتج</h3>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="ابحث عن المنتج بالاسم أو الباركود"
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                    />
               
                  </div>
                  {isSearching && <p className="text-sm">جاري البحث...</p>}
                  {selectedProduct ? (
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h4 className="font-medium">
                            {selectedProduct.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            باركود: {selectedProduct.barcode}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProduct(null)}
                        >
                          إلغاء
                        </Button>
                      </div>
                      <h5 className="font-medium mb-2">الدفعات المتاحة:</h5>
                      {(() => {
                        const availableBatches = selectedProduct.batches.filter(batch => {
                          const isAlreadyAdded = invoiceItems.some(item => item.batchId === batch.id);
                          return !isAlreadyAdded && batch.quantity > 0;
                        });

                        if (availableBatches.length === 0) {
                          return (
                            <p className="text-sm text-gray-500">
                              لا توجد دفعات متاحة لهذا المنتج أو تم إضافة جميع الدفعات المتاحة
                            </p>
                          );
                        }

                        return (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {availableBatches.map((batch) => (
                              <div
                                key={batch.id}
                                className="border p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                                onClick={() =>
                                  handleBatchSelect(selectedProduct, batch)
                                }
                              >
                                <div className="flex justify-between">
                                  <span>الكمية المتاحة: {batch.quantity}</span>
                                  <span>
                                    سعر الشراء:{" "}
                                    {batch.purchaseItem?.purchasePrice}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  المورد: {batch.supplier || "غير معروف"}
                                </p>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    products.length > 0 && (
                      <div className="border rounded-md max-h-40 overflow-y-auto">
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleProductSelect(product)}
                          >
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">
                              باركود: {product.barcode}
                            </p>
                            <p className="text-sm text-gray-500">
                              الدفعات المتاحة: {product.batches.length}
                            </p>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* قائمة المنتجات المضافة */}
            {invoiceItems.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">المنتجات المضافة</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المنتج
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المورد
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الكمية المتاحة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الكمية
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          سعر الوحدة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجمالي
                        </th>
                        {!isDisabled && (
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoiceItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.productName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {item.supplier || "غير معروف"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {item.availableQuantity}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isDisabled ? (
                              <div className="text-sm text-gray-900">
                                {item.soldQuantity}
                              </div>
                            ) : (
                              <Input
                                type="number"
                                min="1"
                                max={item.availableQuantity}
                                value={item.soldQuantity}
                                onChange={(e) =>
                                  updateItemQuantity(
                                    index,
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-20"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isDisabled ? (
                              <div className="text-sm text-gray-900">
                                {item.unitPrice.toFixed(2)}
                              </div>
                            ) : (
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateItemPrice(
                                    index,
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="w-24"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {(item.soldQuantity * item.unitPrice).toFixed(2)}
                            </div>
                          </td>
                          {!isDisabled && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeItem(index)}
                              >
                                حذف
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* أزرار الإجراءات */}
            {mode !== "view" && role === "maintenance" && (
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || invoiceItems.length === 0}
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
