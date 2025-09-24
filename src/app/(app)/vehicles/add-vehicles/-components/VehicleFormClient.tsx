"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import WorkOrdersTable from "./WorkOrdersTable";

export interface WorkOrder {
  id?: string;
  File_number?: string;
  Type_of_repair?: string;
  number_work?: string;
  date_number_work?: string;
  file_number_work?: 'PDF' | 'IMAGE' | null;
  file_number_work_path?: string | null;
  examination_status?: string;
  examination_date?: string;
  file_examination?: 'PDF' | 'IMAGE' | null;
  file_examination_path?: string | null;
  price_work?: string;
  Checkstatus?: string;
  Check_number?: string;
  Check_date?: string;
  file_check?: 'PDF' | 'IMAGE' | null;
  file_check_path?: string | null;
  Electronic_invoice_status?: string;
  Electronic_invoice_date?: string;
  Electronic_invoice_number?: string;
  file_electronic_invoice?: 'PDF' | 'IMAGE' | null;
  file_electronic_invoice_path?: string | null;
}

interface VehicleFormClientProps {
  initialVehicle?: {
    id?: string;
    name?: string;
    Government_number?: string;
    royal_number?: string;
    shape?: string;
    model?: string;
    address?: string;
    date?: string;
    work_kind?: string;
    work_kind_date?: string;
    receivingParty?: string;
    workOrders?: WorkOrder[];
  } | null;
}

export default function VehicleFormClient({ initialVehicle }: VehicleFormClientProps) {
  const [form, setForm] = useState({
    name: initialVehicle?.name || "",
    Government_number: initialVehicle?.Government_number || "",
    royal_number: initialVehicle?.royal_number || "",
    shape: initialVehicle?.shape || "",
    model: initialVehicle?.model || "",
    address: initialVehicle?.address || "",
    date: initialVehicle?.date ? initialVehicle.date.substring(0, 10) : "",
    work_kind: initialVehicle?.work_kind || "",
    work_kind_date: initialVehicle?.work_kind_date ? initialVehicle.work_kind_date.substring(0, 10) : "",
    receivingParty: initialVehicle?.receivingParty || ""
  });
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialVehicle?.workOrders || []);
  const [loading, setLoading] = useState(false);

  const handleWorkOrderChange = (idx: number, field: keyof WorkOrder, value: string) => {
    setWorkOrders(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };
  const handleAddWorkOrder = () => {
    setWorkOrders(prev => [
      ...prev,
      {
        File_number: "",
        Type_of_repair: "",
        number_work: "",
        date_number_work: "",
        file_number_work: null,
        file_number_work_path: null,
        examination_status: "Not_checked",
        examination_date: "",
        file_examination: null,
        file_examination_path: null,
        price_work: "",
        Checkstatus: "Not_Withdrawn",
        Check_number: "",
        Check_date: "",
        file_check: null,
        file_check_path: null,
        Electronic_invoice_status: "Not_Done",
        Electronic_invoice_date: "",
        Electronic_invoice_number: "",
        file_electronic_invoice: null,
        file_electronic_invoice_path: null
      }
    ]);
  };
  const handleRemoveWorkOrder = (idx: number) => {
    setWorkOrders(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const method = initialVehicle?.id ? "PUT" : "POST";
    const url = initialVehicle?.id ? `/api/vehicles/${initialVehicle.id}` : "/api/vehicles";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, workOrders }),
    });
    setLoading(false);
    if (res.ok) {
      alert("تم الحفظ بنجاح");
      window.location.href = "/vehicles";
    } else {
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">{initialVehicle ? "تعديل بيانات السيارة" : "إضافة سيارة"}</h2>
        <Input className="w-full" value={form.Government_number} onChange={e => setForm({ ...form, Government_number: e.target.value })} placeholder="الرقم الميرى" />
        <Input className="w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="نوع السيارة" />
        <Input className="w-full" value={form.royal_number} onChange={e => setForm({ ...form, royal_number: e.target.value })} placeholder="الرقم الملكي" />
        <Input className="w-full" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="الموديل" />
        <Input className="w-full" value={form.shape} onChange={e => setForm({ ...form, shape: e.target.value })} placeholder="الشكل" />
        <Input className="w-full" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="الجهة" />
        <Input type="date" className="w-full" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} placeholder="تاريخ الدخول" />
        <Select value={form.receivingParty} onValueChange={val => setForm({ ...form, receivingParty: val })}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الجهة المستلمة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vehiclesDepartment">قسم المركبات</SelectItem>
            <SelectItem value="thirdParties">جهات خارجية</SelectItem>
            <SelectItem value="campaignWithJobOrder">حملة بأمر شغل</SelectItem>
            <SelectItem value="campaignWithoutJobOrder">حملة بدون أمر شغل</SelectItem>
            <SelectItem value="boxMaterials">مواد الصندوق</SelectItem>
            <SelectItem value="warehouseReserve">احتياطي المخزن</SelectItem>
            <SelectItem value="campaignMaterials">مواد الحملات</SelectItem>
          </SelectContent>
        </Select>
        <Select value={form.work_kind} onValueChange={val => setForm({ ...form, work_kind: val })}>
          <SelectTrigger>
            <SelectValue placeholder="حالة أمر الشغل" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Without_a_work_order">بدون أمر شغل</SelectItem>
            <SelectItem value="By_order_of_employment">بأمر شغل</SelectItem>
          </SelectContent>
        </Select>
        
      </form>
      <div className="w-full max-w-screen-2xl mx-auto mt-8">
        <WorkOrdersTable
          workOrders={workOrders}
          onChange={handleWorkOrderChange}
          onAdd={handleAddWorkOrder}
          onRemove={handleRemoveWorkOrder}
        />
      </div>
      <div className="flex justify-end mt-4">
          <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : "حفظ البيانات"}</Button>
        </div>
    </>
  );
} 