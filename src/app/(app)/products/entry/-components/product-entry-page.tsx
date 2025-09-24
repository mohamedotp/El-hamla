"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";

interface Product {
  name: string;
  barcode: string;
  quantity: number;
  price: number;
  total: number;
  unit: string;
  category: string;
  receivingParty: string;
}

interface FormValues {
  products: Product[];
}

const units = [
  { value: "kilo", label: "كيلو" },
  { value: "box", label: "علبة" },
  { value: "piece", label: "قطعة" },
  { value: "liter", label: "لتر" },
  { value: "gram", label: "جرام" },
  { value: "meter", label: "متر" },
  { value: "reel", label: "بكرة" },
];

const categories = [
  { value: "sparePart", label: "قطع غيار" },
  { value: "oil", label: "زيوت" },
  { value: "rawMaterials", label: "خامات" },
  { value: "liquids", label: "سوائل" },
  { value: "meter", label: "متر" },
  { value: "doku", label: "دكو" },
  { value: "oilOffice", label: "زيت مكتب" },
];


const receivingParties = [
  { value: "vehiclesDepartment", label: "قسم المركبات" },
  { value: "thirdParties", label: "جهات خارجية" },
  { value: "campaignWithJobOrder", label: "الحملة بأمر شغل" },
  { value: "campaignWithoutJobOrder", label: "الحملة بدون أمر شغل" },
  { value: "boxMaterials", label: "خامات الصندوق" },
  { value: "warehouseReserve", label: "احتياطي مخزن" },
  { value: "campaignMaterials", label: "خامات الحملة" },
];

export default function ProductEntryPage() {
  const { control, handleSubmit, register, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      products: [
        {
          name: "",
          barcode: generateBarcode(),
          quantity: 1,
          price: 0,
          total: 0,
          unit: "piece",
          category: "sparePart",
          receivingParty: "warehouseReserve",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ name: "products", control });
  const [loading, setLoading] = useState(false);
  const [duplicateNames, setDuplicateNames] = useState<string[]>([]);

  function generateBarcode() {
    return uuidv4().slice(0, 8).toUpperCase();
  }

  const checkForDuplicates = async (names: string[]) => {
    try {
      const res = await axios.post<{ duplicates: string[] }>("/api/products/check-names", { names });
      setDuplicateNames(res.data.duplicates);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFieldChange = (index: number, type: "quantity" | "price") => {
    const quantity = watch(`products.${index}.quantity`) || 0;
    const price = watch(`products.${index}.price`) || 0;
    setValue(`products.${index}.total`, quantity * price);
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (!value?.products) return; // ✅ تأكيد الحماية
  
      if (name?.includes("name")) {
        const names = value.products
  .filter((p): p is Product => typeof p?.name === "string")
  .map((p) => p.name);
      checkForDuplicates(names);
      }
  
      if (name?.includes("quantity") || name?.includes("price")) {
        const match = name.match(/products\.(\d+)\.(quantity|price)/);
        if (match) {
          const index = parseInt(match[1]);
          handleFieldChange(index, match[2] as "quantity" | "price");
        }
      }
    });
  
    return () => subscription.unsubscribe();
  }, [watch]);
  
  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const payload = data.products.map(({ total, ...rest }) => rest);

      const res = await fetch("/api/products/batch-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) throw new Error("فشل في إرسال البيانات");
  
      toast.success("تمت إضافة المنتجات بنجاح");
      reset({
        products: [
          {
            name: "",
            barcode: generateBarcode(),
            quantity: 1,
            price: 0,
            total: 0,
            unit: "piece",
            category: "sparePart", 
            receivingParty: "warehouseReserve",
          },
        ],
      });
    } catch (err) {
      console.error(err);
      toast.error("  من الفرونت : حدث خطأ أثناء الإرسال");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
      <div className="border rounded-md overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الباركود</TableHead>
              <TableHead>الكمية</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>الإجمالي</TableHead>
              <TableHead>الفئة</TableHead>
              <TableHead>الوحدة</TableHead>
              <TableHead>الجهة المستلمة</TableHead>
              <TableHead className="text-center">حذف</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>
                  <Input
                    {...register(`products.${index}.name` as const)}
                    placeholder="اسم المنتج"
                    required
                    className={clsx({ "border-red-500": duplicateNames.includes(watch(`products.${index}.name`)) })}
                  />
                  {duplicateNames.includes(watch(`products.${index}.name`)) && (
                    <p className="text-sm text-red-500">هذا الاسم موجود بالفعل</p>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`products.${index}.barcode` as const)}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={1}
                    {...register(`products.${index}.quantity` as const, { valueAsNumber: true })}
                    required
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    {...register(`products.${index}.price` as const, { valueAsNumber: true })}
                    required
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    {...register(`products.${index}.total` as const)}
                    readOnly
                    className="bg-gray-100"
                  />
                </TableCell>
                <TableCell>
                  <select
                    {...register(`products.${index}.category` as const)}
                    className="w-full h-10 border rounded-md px-2"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <select
                    {...register(`products.${index}.unit` as const)}
                    className="w-full h-10 border rounded-md px-2"
                  >
                    {units.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <select
                    {...register(`products.${index}.receivingParty` as const)}
                    className="w-full h-10 border rounded-md px-2"
                  >
                    {receivingParties.map((party) => (
                      <option key={party.value} value={party.value}>
                        {party.label}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => remove(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              name: "",
              barcode: generateBarcode(),
              quantity: 1,
              price: 0,
              total: 0,
              unit: "piece",
              category: "sparePart",
              receivingParty: "warehouseReserve",
            })
          }
        >
          <PlusCircle className="w-4 h-4 ml-2" />
          إضافة صف جديد
        </Button>

        <Button type="submit" disabled={loading}>
          {loading ? "جارٍ الحفظ..." : "حفظ المنتجات"}
        </Button>
      </div>
    </form>
  );
}
