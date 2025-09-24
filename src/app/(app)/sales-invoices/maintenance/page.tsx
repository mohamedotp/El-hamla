"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRole } from "@/queries/login";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  items: any[];
  user: {
    username: string;
    role: string;
  };
}

interface SalesInvoiceApiResponse {
  invoices: SalesInvoice[];
  pagination: PaginationInfo;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function MaintenanceSalesInvoicesPage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0, page: 1, limit: 10, totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
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

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<SalesInvoiceApiResponse>(
        `/api/sales-invoices?role=maintenance&page=${pagination.page}&limit=${pagination.limit}`
      );
      setInvoices(response.data.invoices);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("خطأ في جلب الفواتير:", error);
      toast.error("حدث خطأ أثناء جلب الفواتير");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);
  
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleCreateInvoice = () => {
    router.push("/sales-invoices/create");
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.vehicle.name.includes(searchTerm) || 
    invoice.vehicle.Government_number.includes(searchTerm)
  );
if (userRole === null) {
  // ممكن تعمل لودينج أو ترجع null مؤقتًا
  return <p>جارٍ التحقق من الصلاحيات...</p>;
}
  // التحقق من صلاحيات المستخدم
  if (userRole !== "maintenance" && userRole !== "admin" ) {
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
        <h1 className="text-2xl font-bold">فواتير المبيعات</h1>
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
          <Button onClick={handleCreateInvoice}>
            إنشاء فاتورة جديدة
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
                  <TableHead>حالة الموافقة</TableHead>
                  <TableHead>حالة الصرف</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      لا توجد فواتير
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
                          className={`px-2 py-1 rounded-full text-xs ${invoice.approvalStatus === "Approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {invoice.approvalStatus === "Approved" ? "تمت الموافقة" : "غير معتمد"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${invoice.disbursementStatus === "Disbursed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {invoice.disbursementStatus === "Disbursed" ? "تم الصرف" : "لم يتم الصرف"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          <Link href={`/sales-invoices/details/${invoice.id}`}>
                            <Button variant="outline" size="sm">
                              عرض التفاصيل
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => handlePageChange(pagination.page - 1)} />
                  </PaginationItem>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink isActive={pagination.page === page} onClick={() => handlePageChange(page)}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext onClick={() => handlePageChange(pagination.page + 1)} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}