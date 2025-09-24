"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { yupResolver } from "@hookform/resolvers/yup";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { InferType, object, string } from "yup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const schema = object({
  name: string().required().label("إسم المنتج"),
  barcode: string().label("الباركود"),
  category: string().required().label("الفئة"),
  unit: string().required().label("الوحدة"),
  receivingParty: string().required().label("الجهة المستلمة"),
});

const generateBarcode = () => {
  return Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
};

export default function CreateProductPage() {
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      barcode: generateBarcode(),
      category: "",
      unit: "",
      receivingParty: "",
    }
  });

  const [categories, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const translateCategory = (category: string): string => {
      const translations: Record<string, string> = {
        sparePart: "قطعة غيار",
        rawMaterials: "خامات",
        meter: "عداد",
        doku: "دوكو",
        liquids: "سوائل",
        oil: "زيوت",
        oilOffice: "مكتب الزيت",
      };
      return translations[category] || category; // إرجاع الترجمة أو الاسم الأصلي
    };
  useEffect(() => {
      const fetchCategories = async () => {
        try {
          const res = await fetch("/api/categories");
          const data: string[] = await res.json(); // البيانات هي مصفوفة نصية
    
          // تحويل المصفوفة النصية إلى كائنات مع الترجمة
          setCategoryOptions(
            data.map((categoryName: string, index: number) => ({
              label: translateCategory(categoryName),
              value: String(index), // استخدام الفهرس كقيمة مؤقتة (أو استبدلها ب ID حقيقي)
            }))
          );
        } catch (error) {
          console.error("Error fetching categories", error);
        }
      };
      fetchCategories();
    }, []);
    
  const [units, setUnits] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch("/api/units");
        const data: string[] = await res.json(); // افتراض أن البيانات مصفوفة نصوص
  
        setUnits(
          data.map((unitName: string, index: number) => ({
            label: translateUnit(unitName), // دالة الترجمة
            value: String(index), // أو استخدم ID حقيقي إذا متوفر
          }))
        );
      } catch (error) {
        console.error("Error fetching units:", error);
      }
    };
  
    fetchUnits();
  }, []);
  // دالة ترجمة الوحدات
  const translateUnit = (unit: string): string => {
    const translations: Record<string, string> = {
      kilo : "كيلو",
      box : "علبة",
      piece: "قطعة",
      liter :"لتر",
      gram :"جرام",
      meter:"متر ",
      reel : "بكرة",
      // أضف باقي الترجمات
    };
    return translations[unit] || unit;
  };
  // داخل الكومبوننت الرئيسي
  const [receivingParties, setReceivingParties] = useState<{ value: string; label: string }[]>([]);
  
  useEffect(() => {
    const fetchReceivingParties = async () => {
      try {
        const res = await fetch("/api/receiving-parties");
        const data: string[] = await res.json(); // افتراض أن البيانات مصفوفة نصوص
  
        setReceivingParties(
          data.map((partyName: string, index: number) => ({
            label: translateParty(partyName), // دالة الترجمة
            value: String(index), // أو استخدم ID حقيقي
          }))
        );
      } catch (error) {
        console.error("Error fetching receiving parties:", error);
      }
    };
  
    fetchReceivingParties();
  }, []);
  
  // دالة ترجمة الجهات المستلمة
  const translateParty = (party: string): string => {
    const translations: Record<string, string> = {
      vehiclesDepartment :"قسم المركبات",
    thirdParties :"جهات خارجية",   
    campaignWithJobOrder :"الحملة بأمر شغل",
    campaignWithoutJobOrder :"الحملة بدون أمر شغل",
    boxMaterials :"خامات الصندوق",
    warehouseReserve:"احتطياتى مخزن",
    campaignMaterials:"خامات الحملة"
    };
    return translations[party] || party;
  };

  // جلب البيانات

  // دالة إرسال النموذج
  const onSubmit = async (data: InferType<typeof schema>) => {
  try {
    // تحقق من التكرار أولاً
    const checkResponse = await fetch("/api/products/check-names", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names: [data.name] }),
    });

    const checkResult = await checkResponse.json();

    if (checkResult.duplicates && checkResult.duplicates.includes(data.name)) {
      toast.error("اسم المنتج موجود بالفعل في قاعدة البيانات");
      return; // وقف الإرسال
    }

    // تابع إضافة المنتج
    const numericData = {
      ...data,
      category: parseInt(data.category),
      unit: parseInt(data.unit),
      receivingParty: parseInt(data.receivingParty),
    };

    const response = await fetch("/api/products/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(numericData),
    });

    if (response.ok) {
      toast.success("تم إنشاء المنتج بنجاح");
      reset();
      window.location.href = "/products";
    } else {
      const errorData = await response.json();
      toast.error(errorData.message || "حدث خطأ أثناء الإنشاء");
    }
  } catch (err) {
    console.error("Error:", err);
    toast.error("حدث خطأ في الاتصال بالخادم");
  }
};

  
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إضافة منتج جديد</h1>
        <Link href="/products">
          <Button variant="outline">العودة إلى القائمة</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* حقل اسم المنتج */}
        <div className="space-y-2">
          <Label>إسم المنتج</Label>
          <Input {...register("name")} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        {/* حقل الباركود */}
        <div className="space-y-2">
          <Label>الباركود</Label>
          <div className="flex gap-2">
            <Input {...register("barcode")} readOnly />
            <Button
              type="button"
              variant="outline"
              onClick={() => setValue("barcode", generateBarcode())}
            >
              توليد جديد
            </Button>
          </div>
        </div>

        {/* حقل الفئة */}
        <div className="space-y-2">
          <Label>الفئة</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
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
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>الوحدة</Label>
          <Controller
            name="unit"
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
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>
         <div className="space-y-2">
                        <Label>الجهة المستلمة</Label>
                        <Controller
                        name="receivingParty"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الجهة المستلمة" />
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
                        <p className="text-xs text-destructive">{errors.receivingParty?.message}</p>
                    </div>
        {/* باقي الحقول بنفس النمط */}
        
        <div className="flex gap-4 justify-end mt-6">
          <Button type="submit" >
            حفظ المنتج
          </Button>
        </div>
      </form>
    </div>
  );
}

// دوال الترجمة للوحدات والجهات المستلمة
const translateUnit = (unit: string) => ({/* ... */});
const translateParty = (party: string) => ({/* ... */});