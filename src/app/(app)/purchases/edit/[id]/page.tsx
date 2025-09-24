"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreatePurchasePageEnhanced } from "@/features/purchase/edit/edit-purchase-page";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

// تعريف الأنواع
type Supplier = {
  id: string;
  name: string;
};

type Buyer = {
  id: string;
  name: string;
};

export default function EditPurchaseInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const [suppliers, setSuppliers] = useState<{ value: string; label: string }[]>([]);
  const [buyers, setBuyers] = useState<{ value: string; label: string }[]>([]);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب بيانات الموردين
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/suppliers");
        if (response.ok) {
          const data: Supplier[] = await response.json();
          setSuppliers(
            data.map((supplier) => ({
              value: supplier.id,
              label: supplier.name,
            }))
          );
        } else {
          console.error("Failed to fetch suppliers:", response.status);
          toast.error("فشل في جلب بيانات الموردين");
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast.error("حدث خطأ أثناء جلب بيانات الموردين");
      }
    };

    fetchSuppliers();
  }, []);

  // جلب بيانات المندوبين
  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const response = await fetch("/api/buyer");
        if (response.ok) {
          const data: Buyer[] = await response.json();
          setBuyers(
            data.map((buyer) => ({
              value: buyer.id,
              label: buyer.name,
            }))
          );
        } else {
          console.error("Failed to fetch buyers:", response.status);
          toast.error("فشل في جلب بيانات المندوبين");
        }
      } catch (error) {
        console.error("Error fetching buyers:", error);
        toast.error("حدث خطأ أثناء جلب بيانات المندوبين");
      }
    };

    fetchBuyers();
  }, []);

  // جلب بيانات الفاتورة
  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/purchases/${id}`);
        if (response.ok) {
          const data = await response.json();
          setInvoice(data);
        } else if (response.status === 404) {
          setError("فاتورة المشتريات غير موجودة");
          toast.error("فاتورة المشتريات غير موجودة");
        } else {
          setError("فشل في جلب بيانات الفاتورة");
          toast.error("فشل في جلب بيانات الفاتورة");
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        setError("حدث خطأ أثناء جلب بيانات الفاتورة");
        toast.error("حدث خطأ أثناء جلب بيانات الفاتورة");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/purchases")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">تعديل فاتورة المشتريات</h1>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="mr-2">جاري تحميل البيانات...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/purchases")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">تعديل فاتورة المشتريات</h1>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push("/purchases")}>
              العودة إلى قائمة المشتريات
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/purchases")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">تعديل فاتورة المشتريات</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        {invoice ? (
          <CreatePurchasePageEnhanced
            buyers={buyers}
            suppliers={suppliers}
            invoice={invoice}
            isEditMode={true}
          />
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">لا يمكن العثور على الفاتورة</p>
            <Button onClick={() => router.push("/purchases")}>
              العودة إلى قائمة المشتريات
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}