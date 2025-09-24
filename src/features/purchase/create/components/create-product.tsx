"use client";

import { useFieldArray, useForm, Controller } from "react-hook-form";
import { Plus, Trash } from "@phosphor-icons/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { InferType, object, string, array } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const schema = object({
  products: array().of(
    object({
      name: string().required("مطلوب"),
      barcode: string().required("مطلوب"),
      category: string().required("مطلوب"),
      unit: string().required("مطلوب"),
      receivingParty: string().required("مطلوب"),
    })
  ),
});

export default function CreateProductDialog({
  onProductsCreated,
}: {
  onProductsCreated?: (products: any[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const generateBarcode = () =>
    Math.floor(1000000000000 + Math.random() * 9000000000000).toString();

  type Category =
    | "sparePart"
    | "rawMaterials"
    | "meter"
    | "doku"
    | "liquids"
    | "oil"
    | "oilOffice";

  type Unit =
    | "kilo"
    | "box"
    | "piece"
    | "liter"
    | "gram"
    | "meter"
    | "reel";

  type ReceivingParty =
    | "vehiclesDepartment"
    | "thirdParties"
    | "campaignWithJobOrder"
    | "campaignWithoutJobOrder"
    | "boxMaterials"
    | "warehouseReserve"
    | "campaignMaterials";

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      products: [
        {
          name: "",
          barcode: generateBarcode(),
          category: "",
          unit: "",
          receivingParty: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const onSubmit = async (data: InferType<typeof schema>) => {
    setPending(true);
    try {
      const checkRes = await fetch("/api/products/check-names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          names: data.products?.map((p) => p.name.trim()) ?? [],
        }),
      });

      const checkData = await checkRes.json();

      if (checkData.duplicates && checkData.duplicates.length > 0) {
        toast.error(
          ` الأسماء التالية مكررة: ${checkData.duplicates.join(", ")}`
        );
        setPending(false);
        return;
      }

      const res = await fetch("/api/products/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.products),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success("تم إنشاء المنتجات بنجاح");
        reset({
          products: [
            {
              name: "",
              barcode: generateBarcode(),
              category: "",
              unit: "",
              receivingParty: "",
            },
          ],
        });
        setOpen(false);
        if (onProductsCreated) onProductsCreated(result.products);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "فشل في إنشاء المنتجات");
      }
    } catch (error) {
      console.error("Error creating products:", error);
      toast.error("حدث خطأ أثناء إرسال البيانات");
    }

    setPending(false);
  };

  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const [units, setUnits] = useState<{ label: string; value: string }[]>([]);
  const [receivingParties, setReceivingParties] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: Category[]) =>
        setCategories(
          data.map((x) => ({ label: translateCategory(x), value: x }))
        )
      );

    fetch("/api/units")
      .then((res) => res.json())
      .then((data: Unit[]) =>
        setUnits(data.map((x) => ({ label: translateUnit(x), value: x })))
      );

    fetch("/api/receiving-parties")
      .then((res) => res.json())
      .then((data: ReceivingParty[]) =>
        setReceivingParties(
          data.map((x) => ({ label: translateParty(x), value: x }))
        )
      );
  }, []);

  const translateCategory = (c: Category) =>
    ({
      sparePart: "قطعة غيار",
      rawMaterials: "خامات",
      meter: "عدادات",
      doku: "دوكو",
      liquids: "سوائل",
      oil: "زيوت",
      oilOffice: "زيوت (مكتب)",
    }[c]);

  const translateUnit = (u: Unit) =>
    ({
      kilo: "كيلو",
      box: "علبة",
      piece: "قطعة",
      liter: "لتر",
      gram: "جرام",
      meter: "متر",
      reel: "بكرة",
    }[u]);

  const translateParty = (p: ReceivingParty) =>
    ({
      vehiclesDepartment: "قسم المركبات",
      thirdParties: "جهات خارجية",
      campaignWithJobOrder: "الحملة بأمر شغل",
      campaignWithoutJobOrder: "الحملة بدون أمر شغل",
      boxMaterials: "خامات الصندوق",
      warehouseReserve: "احتياطي مخزن",
      campaignMaterials: "خامات الحملة",
    }[p]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إضافة منتجات جديدة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogTitle>إنشاء منتجات جديدة</DialogTitle>
        <DialogDescription>
          يمكنك إضافة منتجات متعددة في نفس الوقت
        </DialogDescription>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المنتج</TableHead>
                  <TableHead>الباركود</TableHead>
                  <TableHead>التصنيف</TableHead>
                  <TableHead>الوحدة</TableHead>
                  <TableHead>جهة الاستلام</TableHead>
                  <TableHead>حذف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input
                        placeholder="اسم المنتج"
                        {...register(`products.${index}.name`)}
                      />
                      {errors.products?.[index]?.name && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.products[index]?.name?.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="الباركود"
                        {...register(`products.${index}.barcode`)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`products.${index}.category`}
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر التصنيف" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.products?.[index]?.category && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.products[index]?.category?.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`products.${index}.unit`}
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الوحدة" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.products?.[index]?.unit && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.products[index]?.unit?.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`products.${index}.receivingParty`}
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر جهة الاستلام" />
                            </SelectTrigger>
                            <SelectContent>
                              {receivingParties.map((party) => (
                                <SelectItem key={party.value} value={party.value}>
                                  {party.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.products?.[index]?.receivingParty && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.products[index]?.receivingParty?.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
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
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                name: "",
                barcode: generateBarcode(),
                category: "",
                unit: "",
                receivingParty: "",
              })
            }
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة صف جديد
          </Button>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin mr-2" />}
              إنشاء المنتجات
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
