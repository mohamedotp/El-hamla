"use client";
import Barcode from "react-barcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Eye, Pencil, Trash } from "@phosphor-icons/react/dist/ssr";
import DatePicker from "../create/components/enhanced-date-picker";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// تعريف الأنواع
type PurchaseInvoice = {
  id: string;
  date: string;
  supplier: {
    id: string;
    name: string;
  };
  Buyer?: {
    id: string;
    name: string;
  } | null;
  user: {
    id: string;
    username: string;
    role: string;
  };
  items: PurchaseInvoiceItem[];
};

type PurchaseInvoiceItem = {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    barcode: string;
    category: string;
    unit: string;
    receivingParty: string;
  };
  quantity: number;
  purchasePrice: number;
  isReserved: boolean;
  vehicle?: {
    id: string;
    name: string;
    Government_number: string;
    royal_number: string;
  } | null;
};

type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// مكون عرض تفاصيل الفاتورة
const InvoiceDetailsDialog = ({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: PurchaseInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!invoice) return null;

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>تفاصيل فاتورة المشتريات</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>رقم الفاتورة</Label>
          <div className="p-2 border rounded">{invoice.id}</div>
        </div>
        <div>
          <Label>التاريخ</Label>
          <div className="p-2 border rounded">
            {format(new Date(invoice.date), "PPP", { locale: ar })}
          </div>
        </div>
        <div>
          <Label>المورد</Label>
          <div className="p-2 border rounded">{invoice.supplier.name}</div>
        </div>
        <div>
          <Label>المندوب</Label>
          <div className="p-2 border rounded">
            {invoice.Buyer?.name || "غير محدد"}
          </div>
        </div>
        <div>
          <Label>المستخدم</Label>
          <div className="p-2 border rounded">{invoice.user.username}</div>
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-2">الأصناف</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>اسم الصنف</TableHead>
              <TableHead>الباركود</TableHead>
              <TableHead>الكمية</TableHead>
              <TableHead>سعر الشراء</TableHead>
              <TableHead>الإجمالي</TableHead>
              <TableHead>رقم السيارة</TableHead>
              <TableHead>إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>
                  <Barcode
                    value={item.product.barcode || "000000"}
                    height={40}
                    width={1.5}
                    fontSize={10}
                  />
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.purchasePrice}</TableCell>
                <TableCell>{item.quantity * item.purchasePrice}</TableCell>
                <TableCell>
                  {item.vehicle
                    ? `${item.vehicle.name} - ${item.vehicle.Government_number}`
                    : "غير محدد"}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      window.open(`/barcode/product/${item.product.id}`, "_blank");
                    }}
                  >
                    طباعة باركود
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DialogContent>
  </Dialog>
);
}
// الصفحة الرئيسية لعرض فواتير المشتريات
export default function PurchaseInvoicesPage() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [invoiceIdFilter, setInvoiceIdFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedInvoice, setSelectedInvoice] =
    useState<PurchaseInvoice | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // جلب الفواتير
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let url = `/api/purchases/get?page=${pagination.page}&limit=${pagination.limit}`;

      if (invoiceIdFilter) {
        url += `&invoiceId=${invoiceIdFilter}`;
      }

      if (startDate) {
        url += `&startDate=${startDate.toISOString()}`;
      }

      if (endDate) {
        url += `&endDate=${endDate.toISOString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices);
        setPagination(data.pagination);
      } else {
        toast.error("فشل في جلب فواتير المشتريات");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("حدث خطأ أثناء جلب فواتير المشتريات");
    } finally {
      setLoading(false);
    }
  };

  // تحميل الفواتير عند تغيير الصفحة أو المرشحات
  useEffect(() => {
    fetchInvoices();
  }, [pagination.page]);

  // تطبيق المرشحات
  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchInvoices();
  };

  // إعادة تعيين المرشحات
  const resetFilters = () => {
    setInvoiceIdFilter("");
    setStartDate(undefined);
    setEndDate(undefined);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchInvoices();
  };

  // عرض تفاصيل الفاتورة
  const showInvoiceDetails = (invoice: PurchaseInvoice) => {
    setSelectedInvoice(invoice);
    setDetailsDialogOpen(true);
  };

  // حذف فاتورة
  const deleteInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/purchases/${invoiceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("تم حذف الفاتورة بنجاح");
        fetchInvoices();
      } else {
        const errorData = await response.json();
        toast.error(
          `فشل في حذف الفاتورة: ${errorData.error || "خطأ غير معروف"}`
        );
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("حدث خطأ أثناء حذف الفاتورة");
    }
  };

  // الانتقال إلى صفحة تعديل الفاتورة
  const editInvoice = (invoiceId: string) => {
    window.location.href = `/purchases/edit/${invoiceId}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* عنوان الصفحة */}
      <h1 className="text-2xl font-bold">فواتير المشتريات</h1>

      {/* مرشحات البحث */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">البحث</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="invoiceId">رقم الفاتورة</Label>
            <Input
              id="invoiceId"
              value={invoiceIdFilter}
              onChange={(e) => setInvoiceIdFilter(e.target.value)}
              placeholder="أدخل رقم الفاتورة"
            />
          </div>
          <div>
            <Label>من تاريخ</Label>
            <DatePicker value={startDate} onChange={setStartDate} />
          </div>
          <div>
            <Label>إلى تاريخ</Label>
            <DatePicker value={endDate} onChange={setEndDate} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={resetFilters}>
            إعادة تعيين
          </Button>
          <Button onClick={applyFilters}>تطبيق</Button>
        </div>
      </div>

      {/* جدول الفواتير */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الفاتورة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>المورد</TableHead>
              <TableHead>المندوب</TableHead>
              <TableHead>عدد الأصناف</TableHead>
              <TableHead>المستخدم</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  لا توجد فواتير مشتريات
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>
                    {format(new Date(invoice.date), "PPP", { locale: ar })}
                  </TableCell>
                  <TableCell>{invoice.supplier.name}</TableCell>
                  <TableCell>{invoice.Buyer?.name || "غير محدد"}</TableCell>
                  <TableCell>{invoice.items.length}</TableCell>
                  <TableCell>{invoice.user.username}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => showInvoiceDetails(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => editInvoice(invoice.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من رغبتك في حذف هذه الفاتورة؟ لا يمكن
                              التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => deleteInvoice(invoice.id)}
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          window.open(
                            `/barcode/${invoice.id}`,
                            "_blank"
                          );
                        }}
                      >
                        🧾 طباعة الباركود
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* ترقيم الصفحات */}
        {pagination.totalPages > 1 && (
          <div className="py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                    className={
                      pagination.page <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: pageNumber,
                            }))
                          }
                          isActive={pagination.page === pageNumber}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                )}

                {pagination.totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: pagination.totalPages,
                          }))
                        }
                        isActive={pagination.page === pagination.totalPages}
                      >
                        {pagination.totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(pagination.totalPages, prev.page + 1),
                      }))
                    }
                    className={
                      pagination.page >= pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* مربع حوار تفاصيل الفاتورة */}
      <InvoiceDetailsDialog
        invoice={selectedInvoice}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  );
}