"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRole } from "@/queries/login";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface SalesInvoiceDetails {
  id: string;
  date: string;
  vehicle: {
    name: string;
    Government_number: string;
    royal_number: string;
  };
  totalAmount: number;
  approvalStatus: "Approved" | "Notapproved";
  disbursementStatus: "Disbursed" | "NotDisbursed";
  repairMan?: { id: string; name: string; workshopName?: string | null } | null;
  bolRepairMan?: { id: string; name: string } | null;
  workOrder?: { id: string; number: string } | null;
  items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      barcode: string;
      unit: string;
    };
    batch: {
      id: string;
      quantity: number;
      product: {
        name: string;
      };
      purchaseItem?: {
        purchaseInvoice?: {
          supplier?: {
            name: string;
          };
        };
      };
    };
    soldQuantity: number;
    unitPrice: number;
    availableQuantity: number;
  }>;
  user: {
    username: string;
    role: string;
  };
  createdBy: string;
}

export default function SalesInvoiceDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [invoice, setInvoice] = useState<SalesInvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const router = useRouter();

  useEffect(() => {
    // استرجاع معلومات المستخدم من التخزين المحلي
    const userInfoStr = localStorage.getItem("userInfo");

    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUserRole(userInfo.role as UserRole);
      } catch (error) {
        console.error("خطأ في تحليل معلومات المستخدم:", error);
      }
    }
  }, []);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [params.id]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get<SalesInvoiceDetails>(
        `/api/sales-invoices/${params.id}`,
      );
      setInvoice(response.data);
    } catch (error) {
      console.error("خطأ في جلب تفاصيل الفاتورة:", error);
      toast.error("حدث خطأ أثناء جلب تفاصيل الفاتورة");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await axios.patch(`/api/sales-invoices/${params.id}/approval`, {
        approvalStatus: "Approved",
      });
      toast.success("تمت الموافقة على الفاتورة بنجاح");
      fetchInvoiceDetails();
    } catch (error) {
      console.error("خطأ في تحديث حالة الفاتورة:", error);
      toast.error("حدث خطأ أثناء تحديث حالة الفاتورة");
    }
  };

  const handleReject = async () => {
    try {
      await axios.patch(`/api/sales-invoices/${params.id}`, {
        approvalStatus: "Notapproved",
      });
      toast.success("تم رفض الفاتورة بنجاح");
      fetchInvoiceDetails();
    } catch (error) {
      console.error("خطأ في تحديث حالة الفاتورة:", error);
      toast.error("حدث خطأ أثناء تحديث حالة الفاتورة");
    }
  };

  const handleBack = () => {
    if (userRole === "admin") {
      router.push("/sales-invoices/admin");
    } else if (userRole === "warehouse") {
      router.push("/sales-invoices/warehouse");
    } else if (userRole === "maintenance") {
      router.push("/sales-invoices/maintenance");
    } else {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <p>جاري تحميل تفاصيل الفاتورة...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>خطأ</CardTitle>
          </CardHeader>
          <CardContent>
            <p>لم يتم العثور على الفاتورة</p>
            <Button onClick={handleBack} className="mt-4">
              العودة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">تفاصيل فاتورة المبيعات</h1>
        <Button onClick={handleBack} variant="outline">
          العودة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>معلومات الفاتورة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">رقم الفاتورة</p>
                <p>{invoice.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">التاريخ</p>
                <p>
                  {format(new Date(invoice.date), "yyyy/MM/dd", { locale: ar })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">المبلغ الإجمالي</p>
                <p>{invoice.totalAmount.toFixed(2)} ج.م</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">حالة الموافقة</p>
                <p
                  className={
                    invoice.approvalStatus === "Approved"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {invoice.approvalStatus === "Approved"
                    ? "تمت الموافقة"
                    : "غير معتمد"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">حالة الصرف</p>
                <p
                  className={
                    invoice.disbursementStatus === "Disbursed"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {invoice.disbursementStatus === "Disbursed"
                    ? "تم الصرف"
                    : "لم يتم الصرف"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">تم الإنشاء بواسطة</p>
                <p>{invoice.user?.username || "غير معروف"}</p>
              </div>
            </div>
          </CardContent>
          {userRole === "admin" && (
            <CardFooter className="flex justify-end gap-2">
              {invoice.approvalStatus !== "Approved" && (
                <Button onClick={handleApprove}>موافقة</Button>
              )}
              {invoice.approvalStatus === "Approved" && (
                <Button onClick={handleReject} variant="destructive">
                  رفض
                </Button>
              )}
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات السيارة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">اسم السيارة</p>
                <p>{invoice.vehicle.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">الرقم الحكومي</p>
                <p>{invoice.vehicle.Government_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">الرقم الملكي</p>
                <p>{invoice.vehicle.royal_number}</p>
              </div>
              {invoice.workOrder && (
                <div>
                  <p className="text-sm text-gray-500">رقم أمر العمل</p>
                  <p>{invoice.workOrder.number}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {invoice.disbursementStatus === "Disbursed" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>معلومات الصرف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">فني الصيانة</p>
                <p>{invoice.repairMan?.name || "غير محدد"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">اسم الورشة</p>
                <p>{invoice.repairMan?.workshopName || "غير محدد"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">مسؤول الصيانة</p>
                <p>{invoice.bolRepairMan?.name || "غير محدد"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>الأصناف</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الصنف</TableHead>
                <TableHead>الباركود</TableHead>
                <TableHead>الوحدة</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>المورد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>{item.product.barcode}</TableCell>
                  <TableCell>{item.product.unit}</TableCell>
                  <TableCell>{item.soldQuantity}</TableCell>
                  <TableCell>{item.unitPrice.toFixed(2)} ج.م</TableCell>
                  <TableCell>
                    {(item.soldQuantity * item.unitPrice).toFixed(2)} ج.م
                  </TableCell>
                  <TableCell>
                    {item.batch.purchaseItem?.purchaseInvoice?.supplier?.name ||
                      "غير معروف"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
