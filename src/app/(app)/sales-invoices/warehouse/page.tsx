"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/queries/login";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";
import SearchSelect from "@/features/purchase/create/components/enhanced-search-select";
import { RepairManForm } from "@/features/repairman/components/repairman-form";

interface RepairMan {
  id: string;
  name: string;
  workshopName?: string | null;
}

interface BolRepairMan {
  id: string;
  name: string;
}

interface SalesInvoice {
  id: string;
  date: string;
  vehicle: {
    name: string;
    Government_number: string;
  };
  totalAmount: number;
  approvalStatus: "Approved" | "Notapproved";
  disbursementStatus: "Disbursed" | "NotDisbursed";
  repairMan?: { id: string; name: string; workshopName?: string | null } | null;
  bolRepairMan?: { id: string; name: string } | null;
  items: any[];
  user: {
    username: string;
    role: string;
  };
}

interface RepairManApiResponse {
  repairmen: RepairMan[];
  pagination: any; // You can define a more specific type if needed
}

export default function WarehouseSalesInvoicesPage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [repairMen, setRepairMen] = useState<RepairMan[]>([]);
  const [bolRepairMen, setBolRepairMen] = useState<BolRepairMan[]>([]);
  const [selectedRepairMan, setSelectedRepairMan] = useState<string>("");
  const [selectedBolRepairMan, setSelectedBolRepairMan] = useState<string>("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAddRepairManOpen, setIsAddRepairManOpen] = useState(false);
  const [newRepairManId, setNewRepairManId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // استرجاع معلومات المستخدم من التخزين المحلي
    const userInfoStr = localStorage.getItem('userInfo');
    
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUserRole(userInfo.role as UserRole);
      } catch (error) {
        console.error('خطأ في تحليل معلومات المستخدم:', error);
      }
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchRepairMen();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await axios.get<SalesInvoice[]>("/api/sales-invoices/warehouse");
      setInvoices(response.data);
    } catch (error) {
      console.error("خطأ في جلب الفواتير:", error);
      toast.error("حدث خطأ أثناء جلب الفواتير");
    } finally {
      setLoading(false);
    }
  };

  const fetchRepairMen = async () => {
    try {
      const [repairMenResponse, bolRepairMenResponse] = await Promise.all([
        axios.get<RepairManApiResponse>("/api/repairman"),
        axios.get<BolRepairMan[]>("/api/bolrepairman"),
      ]);
      
      setRepairMen(repairMenResponse.data.repairmen);
      setBolRepairMen(bolRepairMenResponse.data);
    } catch (error) {
      console.error("خطأ في جلب بيانات فنيي الصيانة:", error);
      toast.error("حدث خطأ أثناء جلب بيانات فنيي الصيانة");
    }
  };

  const handleDisbursement = async () => {
    if (!selectedRepairMan || !selectedBolRepairMan) {
      toast.error("يرجى اختيار فني الصيانة ومسؤول الصيانة");
      return;
    }

    try {
      await axios.patch(`/api/sales-invoices/${selectedInvoiceId}`, {
        repairManId: selectedRepairMan,
        bolRepairManId: selectedBolRepairMan,
        disbursementStatus: "Disbursed"
      });
      toast.success("تم صرف الفاتورة بنجاح");
      setDialogOpen(false);
      fetchInvoices();
    } catch (error) {
      console.error("خطأ في تحديث حالة الفاتورة:", error);
      toast.error("حدث خطأ أثناء تحديث حالة الفاتورة");
    }
  };

  const openDisbursementDialog = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setSelectedRepairMan("");
    setSelectedBolRepairMan("");
    setDialogOpen(true);
  };

  const handleAddRepairManSuccess = () => {
    setIsAddRepairManOpen(false);
    fetchRepairMen();
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.vehicle.name.includes(searchTerm) || 
    invoice.vehicle.Government_number.includes(searchTerm)
  );

  // التحقق من صلاحيات المستخدم
  if (userRole !== "warehouse" && userRole !== "admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>غير مصرح</CardTitle>
        </CardHeader>
        <CardContent>
          <p>ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">فواتير المبيعات المعتمدة</h1>
        <div className="flex gap-4">
          <Input
            placeholder="بحث عن سيارة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button onClick={fetchInvoices} variant="outline">
            تحديث
          </Button>
        </div>
      </div>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>السيارة</TableHead>
                  <TableHead>رقم السيارة</TableHead>
                  <TableHead>المبلغ الإجمالي</TableHead>
                  <TableHead>حالة الصرف</TableHead>
                  <TableHead>المنتجات</TableHead>
                  <TableHead>فني الصيانة</TableHead>
                  <TableHead>اسم الورشة</TableHead>
                  <TableHead>مسؤول الصيانة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      لا توجد فواتير معتمدة
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {format(new Date(invoice.date), "yyyy/MM/dd", { locale: ar })}
                      </TableCell>
                      <TableCell>{invoice.vehicle.name}</TableCell>
                      <TableCell>{invoice.vehicle.Government_number}</TableCell>
                      <TableCell>{invoice.totalAmount.toFixed(2)} ج.م</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${invoice.disbursementStatus === "Disbursed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {invoice.disbursementStatus === "Disbursed" ? "تم الصرف" : "لم يتم الصرف"}
                        </span>
                      </TableCell>
                      <TableCell>{invoice.items.map(item => item.product.name).join(", ")}</TableCell>
                      <TableCell>{invoice.repairMan?.name || "غير محدد"}</TableCell>
                      <TableCell>{invoice.repairMan?.workshopName || "غير محدد"}</TableCell>
                      <TableCell>{invoice.bolRepairMan?.name || "غير محدد"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <Link href={`/sales-invoices/details/${invoice.id}`}>
                            <Button variant="outline" size="sm">
                              عرض التفاصيل
                            </Button>
                          </Link>
                          {invoice.disbursementStatus !== "Disbursed" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openDisbursementDialog(invoice.id)}
                            >
                              صرف
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>صرف الفاتورة</DialogTitle>
            <DialogDescription>
              يرجى اختيار فني الصيانة ومسؤول الصيانة لإتمام عملية الصرف
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="repairMan" className="text-right col-span-1">
                فني الصيانة
              </label>
              <div className="col-span-3 flex gap-2 items-center">
                <SearchSelect
                  placeholder="المندوب"
                  data={repairMen.map((repairMan) => ({
                    label: repairMan.name,
                    value: repairMan.id,
                  }))}
                  value={selectedRepairMan}
                  onValueChange={setSelectedRepairMan}
                />
                <Button type="button" size="sm" variant="outline" onClick={() => setIsAddRepairManOpen(true)}>
                  + إضافة فني
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="bolRepairMan" className="text-right col-span-1">
                مسؤول الصيانة
              </label>
              <Select
                value={selectedBolRepairMan}
                onValueChange={setSelectedBolRepairMan}
              >
                <SelectTrigger className="col-span-3">
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleDisbursement}>
              تأكيد الصرف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RepairManForm
        isOpen={isAddRepairManOpen}
        onOpenChange={setIsAddRepairManOpen}
        onSuccess={handleAddRepairManSuccess}
      />
    </div>
  );
}