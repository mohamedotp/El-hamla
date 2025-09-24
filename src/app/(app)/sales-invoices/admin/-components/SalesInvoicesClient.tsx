"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import axios from "axios";
import { format, parseISO, isAfter, isBefore } from "date-fns";
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
  items: {
    id: string;
    product: {
      name: string;
    };
    soldQuantity: number;
  }[];
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

type UserRole = "admin" | "maintenance" | "store" | "finance"; // حسب حالتك

export default function SalesInvoicesClient() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    setFromDate(today);
    setToDate(today);
  }, []);

  useEffect(() => {
    const userInfoStr = localStorage.getItem("userInfo");
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUserRole(userInfo.role);
      } catch (error) {
        console.error("فشل في جلب معلومات المستخدم:", error);
      }
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
      });
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);

      const response = await axios.get<SalesInvoiceApiResponse>(
        `/api/sales-invoices?${params.toString()}`
      );
      setInvoices(response.data.invoices);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب الفواتير");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, fromDate, toDate]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.patch(`/api/sales-invoices/${id}/approval`, {
        approvalStatus: "Approved",
      });
      toast.success("تمت الموافقة على الفاتورة");
      fetchInvoices();
    } catch (error) {
      toast.error("حدث خطأ أثناء الموافقة");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.patch(`/api/sales-invoices/${id}`, {
        approvalStatus: "Notapproved",
      });
      toast.success("تم إلغاء الموافقة");
      fetchInvoices();
    } catch (error) {
      toast.error("حدث خطأ أثناء الرفض");
    }
  };

  const handleReturn = async (id: string) => {
    const confirmed = confirm("هل تريد عمل مرتجع؟");
    if (!confirmed) return;
    try {
      await axios.post(`/api/sales-invoices/${id}/return`);
      toast.success("تم عمل المرتجع");
      fetchInvoices();
    } catch (error) {
      toast.error("حدث خطأ أثناء تنفيذ المرتجع");
    }
  };

  const filteredInvoices = invoices;

  if (userRole !== "admin") {
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
        <h1 className="text-2xl font-bold">إدارة فواتير المبيعات</h1>
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

      <div className="flex gap-4 items-center mb-4">
        <label className="text-sm">من التاريخ:</label>
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-40"
        />
        <label className="text-sm">إلى التاريخ:</label>
        <Input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-40"
        />
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
                  <TableHead>الموافقة</TableHead>
                  <TableHead>الصرف</TableHead>
                  <TableHead>المنتجات</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      لا توجد فواتير
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {format(new Date(invoice.date), "yyyy/MM/dd", {
                          locale: ar,
                        })}
                      </TableCell>
                      <TableCell>{invoice.vehicle.name}</TableCell>
                      <TableCell>{invoice.vehicle.Government_number}</TableCell>
                      <TableCell>
                        {invoice.totalAmount.toFixed(2)} ج.م
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            invoice.approvalStatus === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {invoice.approvalStatus === "Approved"
                            ? "تمت الموافقة"
                            : "لم يتم الموافقة"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            invoice.disbursementStatus === "Disbursed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {invoice.disbursementStatus === "Disbursed"
                            ? "تم الصرف"
                            : "لم يتم الصرف"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1 max-w-xs">
                          {invoice.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between bg-gray-100 rounded px-2 py-1"
                            >
                              <span className="font-medium text-sm text-gray-800 truncate">
                                {item.product.name}
                              </span>
                              <span className="ml-2 text-xs font-semibold text-gray-600">
                                x{item.soldQuantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 rtl:flex-row-reverse">
                          <Link href={`/sales-invoices/details/${invoice.id}`}>
                            <Button variant="outline" size="sm">
                              عرض
                            </Button>
                          </Link>
                          <Link href={`/sales-invoices/${invoice.id}/edit`}>
                            <Button variant="secondary" size="sm">
                              تعديل
                            </Button>
                          </Link>
                          {invoice.approvalStatus !== "Approved" && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(invoice.id)}
                            >
                              موافقة
                            </Button>
                          )}
                          {invoice.approvalStatus === "Approved" &&
                            invoice.disbursementStatus !== "Disbursed" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReject(invoice.id)}
                              >
                                إلغاء
                              </Button>
                            )}
                          {invoice.approvalStatus === "Approved" &&
                            invoice.disbursementStatus === "Disbursed" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleReturn(invoice.id)}
                              >
                                مرتجع
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
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(pagination.page - 1)}
                    />
                  </PaginationItem>
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={pagination.page === page}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(pagination.page + 1)}
                    />
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
