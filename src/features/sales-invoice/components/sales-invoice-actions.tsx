"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RepairMan {
  id: string;
  name: string;
  workshopName?: string | null;
}

interface BolRepairMan {
  id: string;
  name: string;
}
interface SalesInvoiceActionsProps {
  role: "admin" | "warehouse";
  invoiceId: string;
  currentStatus: {
    approvalStatus: "Approved" | "Notapproved";
    disbursementStatus: "Disbursed" | "NotDisbursed";
  };
  onStatusChange?: () => void;
}

export function SalesInvoiceActions({ role, invoiceId, currentStatus, onStatusChange }: SalesInvoiceActionsProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [repairMen, setRepairMen] = useState<RepairMan[]>([]);
  const [bolRepairMen, setBolRepairMen] = useState<RepairMan[]>([]);
  const [selectedRepairMan, setSelectedRepairMan] = useState("");
  const [selectedBolRepairMan, setSelectedBolRepairMan] = useState("");

  useEffect(() => {
    if (role === "warehouse") {
      fetchRepairMen();
    }
  }, [role]);

  const fetchRepairMen = async () => {
    try {
      const [repairMenResponse, bolRepairMenResponse] = await Promise.all([
        axios.get<RepairMan[]>("/api/sales-invoices/search?type=repairMan"),
        axios.get<BolRepairMan[]>("/api/sales-invoices/search?type=bolRepairMan"),
      ]);
      setRepairMen(repairMenResponse.data);
      setBolRepairMen(bolRepairMenResponse.data);
    } catch (error) {
      console.error("خطأ في جلب بيانات فنيي الصيانة:", error);
      toast.error("حدث خطأ أثناء جلب بيانات فنيي الصيانة");
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      console.log(invoiceId);
      await axios.patch(`/api/sales-invoices/${invoiceId}`, {
        approvalStatus: "Approved",
      });
      toast.success("تمت الموافقة على فاتورة المبيعات بنجاح");
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error("خطأ في الموافقة على فاتورة المبيعات:", error);
      toast.error("حدث خطأ أثناء الموافقة على فاتورة المبيعات");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`/api/sales-invoices/${invoiceId}`);
      toast.success("تم رفض وحذف فاتورة المبيعات بنجاح");
      router.push("/sales-invoices/admin");
    } catch (error) {
      console.error("خطأ في رفض فاتورة المبيعات:", error);
      toast.error("حدث خطأ أثناء رفض فاتورة المبيعات");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisbursement = async () => {
    if (!selectedRepairMan || !selectedBolRepairMan) {
      toast.error("يجب اختيار فني الصيانة ومسؤول الصيانة");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.patch(`/api/sales-invoices/${invoiceId}`, {
        repairManId: selectedRepairMan,
        bolRepairManId: selectedBolRepairMan,
        disbursementStatus: "Disbursed",
      });
      toast.success("تم صرف فاتورة المبيعات بنجاح");
      setIsDialogOpen(false);
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error("خطأ في صرف فاتورة المبيعات:", error);
      toast.error("حدث خطأ أثناء صرف فاتورة المبيعات");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelDisbursement = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`/api/sales-invoices/${invoiceId}`);
      toast.success("تم إلغاء فاتورة المبيعات بنجاح");
      router.push("/sales-invoices/warehouse");
    } catch (error) {
      console.error("خطأ في إلغاء فاتورة المبيعات:", error);
      toast.error("حدث خطأ أثناء إلغاء فاتورة المبيعات");
    } finally {
      setIsSubmitting(false);
    }
  };

  // عرض أزرار الإدارة
  if (role === "admin") {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>إجراءات الإدارة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            حالة الموافقة الحالية:{" "}
            <span className={currentStatus.approvalStatus === "Approved" ? "text-green-600" : "text-amber-600"}>
              {currentStatus.approvalStatus === "Approved" ? "تمت الموافقة" : "لم تتم الموافقة"}
            </span>
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {currentStatus.approvalStatus !== "Approved" && (
            <>
              <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
                رفض وحذف
              </Button>
              <Button onClick={handleApprove} disabled={isSubmitting}>
                موافقة
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    );
  }

  // عرض أزرار المخزن
  if (role === "warehouse") {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>إجراءات المخزن</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            حالة الصرف الحالية:{" "}
            <span className={currentStatus.disbursementStatus === "Disbursed" ? "text-green-600" : "text-amber-600"}>
              {currentStatus.disbursementStatus === "Disbursed" ? "تم الصرف" : "لم يتم الصرف"}
            </span>
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {currentStatus.disbursementStatus !== "Disbursed" && currentStatus.approvalStatus === "Approved" && (
            <>
              <Button variant="destructive" onClick={handleCancelDisbursement} disabled={isSubmitting}>
                إلغاء الفاتورة
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>صرف المنتجات</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>صرف المنتجات</DialogTitle>
                    <DialogDescription>
                      يرجى اختيار فني الصيانة ومسؤول الصيانة قبل إتمام عملية الصرف
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">فني الصيانة</label>
                      <Select value={selectedRepairMan} onValueChange={setSelectedRepairMan}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر فني الصيانة" />
                        </SelectTrigger>
                        <SelectContent>
                          {repairMen.map((repairMan) => (
                            <SelectItem key={repairMan.id} value={repairMan.id}>
                              {repairMan.name} {repairMan.workshopName && `(${repairMan.workshopName})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">مسؤول الصيانة</label>
                      <Select value={selectedBolRepairMan} onValueChange={setSelectedBolRepairMan}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر مسؤول الصيانة" />
                        </SelectTrigger>
                        <SelectContent>
                          {bolRepairMen.map((bolRepairMan) => (
                            <SelectItem key={bolRepairMan.id} value={bolRepairMan.id}>
                              {bolRepairMan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                      إلغاء
                    </Button>
                    <Button onClick={handleDisbursement} disabled={isSubmitting || !selectedRepairMan || !selectedBolRepairMan}>
                      تأكيد الصرف
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardFooter>
      </Card>
    );
  }

  return null;
}