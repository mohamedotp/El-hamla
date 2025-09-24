"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";

import SearchSelect from "./components/enhanced-search-select";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import CreateBuyer from "./components/create-buyer";
import DatePicker from "./components/enhanced-date-picker";
import CreateSupplier from "./components/create-supplier";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// تعريف الأنواع
type Product = {
  id: string;
  name: string;
  barcode: string;
  category: string;
  unit: string;
  receivingParty: string;
};

type Vehicle = {
  id: string;
  name: string;
  Government_number: string;
  royal_number: string;
};

type PurchaseItem = {
  productId: string;
  productName: string;
  quantity: string;
  purchasePrice: string;
  total: string;
  vehicleId?: string;
  vehicleNumber: string;
  isDelivered?: boolean;
  deliveryDate?: Date | string;
};

type FormValues = {
  buyerId: string;
  date: Date;
  supplierId: string;
  items: PurchaseItem[];
};

// استيراد مكون إنشاء منتج جديد
import CreateProduct from "./components/create-product";
import Link from "next/link";
import CreateProductDialog from "./components/create-product";

// مكون البحث عن المنتج
const ProductSearchInput = ({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (product: Product) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  // البحث عن المنتجات باستخدام API
  useEffect(() => {
    const fetchProducts = async () => {
      if (searchTerm.length > 1) {
        try {
          const response = await fetch(`/api/products/search?query=${encodeURIComponent(searchTerm)}`);
          if (response.ok) {
            const data = await response.json();
            setProducts(data);
          }
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      }
    };

    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setSearchTerm(e.target.value);
            }}
            placeholder="اسم الصنف"
            className="w-full"
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="absolute left-0 top-0 h-full"
            onClick={() => setOpen(!open)}
          >
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
        <Command>
          <CommandInput placeholder="بحث عن منتج" value={searchTerm} onValueChange={setSearchTerm} />
          <CommandList>
            <CommandEmpty className="py-2">
              <div className="text-center">
                <p className="mb-2">لا يوجد منتجات مطابقة</p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => {
                    onChange(product.name);
                    onSelect(product);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === product.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {product.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// مكون البحث عن السيارة
const VehicleSearchInput = ({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (vehicle: Vehicle) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // البحث عن السيارات باستخدام API
  useEffect(() => {
    const fetchVehicles = async () => {
      if (searchTerm.length > 1) {
        try {
          const response = await fetch(`/api/vehicles/search?query=${encodeURIComponent(searchTerm)}`);
          if (response.ok) {
            const data = await response.json();
            setVehicles(data);
          }
        } catch (error) {
          console.error("Error fetching vehicles:", error);
        }
      }
    };

    const debounce = setTimeout(() => {
      fetchVehicles();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setSearchTerm(e.target.value);
            }}
            placeholder="رقم السيارة"
            className="w-full"
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="absolute left-0 top-0 h-full"
            onClick={() => setOpen(!open)}
          >
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
        <Command>
          <CommandInput placeholder="بحث عن سيارة" value={searchTerm} onValueChange={setSearchTerm} />
          <CommandList>
            <CommandEmpty className="py-2">
              <div className="text-center">
                <p className="mb-2">لا توجد سيارات مطابقة</p>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {vehicles.map((vehicle) => (
                <CommandItem
                  key={vehicle.id}
                  value={vehicle.Government_number}
                  onSelect={() => {
                    onChange(vehicle.Government_number);
                    onSelect(vehicle);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === vehicle.Government_number ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {vehicle.name} - {vehicle.Government_number}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export function CreatePurchasePageEnhanced({
  buyers,
  suppliers,
}: {
  buyers: { value: string; label: string }[];
  suppliers: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      buyerId: "",
      date: new Date(),
      supplierId: "",
      items: [
        {
          productId: "",
          productName: "",
          quantity: "",
          purchasePrice: "",
          total: "",
          vehicleId: "",
          vehicleNumber: "",
          isDelivered: false,
          deliveryDate: new Date().toISOString(),
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      // التحقق من صحة البيانات قبل الإرسال
      if (!data.supplierId) {
        toast.error("يرجى اختيار المورد");
        return;
      }

      if (data.items.length === 0 || !data.items.some(item => item.productId && parseFloat(item.quantity || "0") > 0)) {
        toast.error("يرجى إضافة منتج واحد على الأقل مع كمية صحيحة");
        return;
      }

      // تحضير البيانات للإرسال
      const purchaseData = {
        ...data,
        items: data.items
          .filter(item => item.productId && parseFloat(item.quantity || "0") > 0)
          .map(item => ({
            productId: item.productId,
            quantity: parseFloat(item.quantity || "0"),
            purchasePrice: parseFloat(item.purchasePrice || "0"),
            vehicleId: item.vehicleId || undefined,
            isDelivered: item.isDelivered ?? false,
            deliveryDate: item.deliveryDate,
          })),
      };

      // إرسال البيانات إلى الخادم
      const response = await fetch("/api/purchases/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(purchaseData),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("تم حفظ فاتورة المشتريات بنجاح");
        console.log("تم إنشاء فاتورة المشتريات:", result);
        router.push("/"); // تصحيح مسار التوجيه
      } else {
        const errorData = await response.json();
        toast.error(`حدث خطأ: ${errorData.error || "خطأ غير معروف"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("حدث خطأ أثناء حفظ فاتورة المشتريات");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 items-end w-full mb-2">
        <div className="flex flex-col gap-4 flex-1">
          <Label>المنتجات</Label>
          <CreateProductDialog
            onProductsCreated={(newProducts) => {
              append(
                newProducts.map((product) => ({
                  productId: product.id,
                  productName: product.name,
                  quantity: "",
                  purchasePrice: "",
                  total: "",
                  vehicleId: "",
                  vehicleNumber: "",
                  isDelivered: false,
                  deliveryDate: new Date().toISOString(),
                }))
              );
            }}
          />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <div className="flex gap-1 items-end w-full">
            <div className="flex flex-col gap-4 flex-1">
              <Label>المندوب</Label>
              <Controller
                name="buyerId"
                control={control}
                render={({ field }) => (
                  <SearchSelect
                    placeholder="المندوب"
                    data={buyers}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </div>
            <CreateBuyer />
          </div>
          <div className="flex gap-2 items-end w-full">
            <div className="flex flex-col gap-4 flex-1">
              <Label>التاريخ</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePicker value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-1 items-end w-full">
          <div className="flex flex-col gap-4 flex-1">
            <Label>المورد</Label>
            <Controller
              name="supplierId"
              control={control}
              render={({ field }) => (
                <SearchSelect
                  placeholder="المورد"
                  data={suppliers}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
          <CreateSupplier />
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>إسم القطعة</TableHead>
                <TableHead>سعر الشراء</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>الاجمالى</TableHead>
                <TableHead>رقم السيارة</TableHead>
                <TableHead>حذف</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <Controller
                      name={`items.${index}.productName`}
                      control={control}
                      render={({ field: productField }) => (
                        <ProductSearchInput
                          value={productField.value}
                          onChange={productField.onChange}
                          onSelect={(product) => {
                            setValue(`items.${index}.productId`, product.id);
                            setValue(`items.${index}.productName`, product.name);
                          }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`items.${index}.purchasePrice`}
                      control={control}
                      render={({ field: priceField }) => (
                        <Input
                          type="number"
                          placeholder="سعر الشراء"
                          {...priceField}
                          value={priceField.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            priceField.onChange(value);

                            const quantity =
                              getValues(`items.${index}.quantity`) || "0";
                            const total = (parseFloat(value || "0") * parseFloat(quantity)).toString();
                            setValue(`items.${index}.total`, total);
                          }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`items.${index}.quantity`}
                      control={control}
                      render={({ field: quantityField }) => (
                        <Input
                          type="number"
                          placeholder="الكمية"
                          {...quantityField}
                          value={quantityField.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            quantityField.onChange(value);

                            const purchasePrice =
                              getValues(`items.${index}.purchasePrice`) || "0";
                            const total = (parseFloat(purchasePrice) * parseFloat(value || "0")).toString();
                            setValue(`items.${index}.total`, total);
                          }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`items.${index}.total`}
                      control={control}
                      render={({ field: totalField }) => (
                        <Input
                          type="number"
                          placeholder="الاجمالى"
                          {...totalField}
                          value={totalField.value || ""}
                          readOnly
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`items.${index}.vehicleNumber`}
                      control={control}
                      render={({ field: vehicleField }) => (
                        <VehicleSearchInput
                          value={vehicleField.value}
                          onChange={vehicleField.onChange}
                          onSelect={(vehicle) => {
                            setValue(`items.${index}.vehicleId`, vehicle.id);
                          }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    {fields.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => remove(index)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                productId: "",
                productName: "",
                quantity: "",
                purchasePrice: "",
                total: "",
                vehicleId: "",
                vehicleNumber: "",
                isDelivered: false,
                deliveryDate: new Date().toISOString(),
              })
            }
          >
            <PlusCircle className="h-4 w-4 ml-2" />
            إضافة صنف
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </div>
      </form>
    </>
  );
}
