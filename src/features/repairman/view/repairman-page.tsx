"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { toast } from "sonner";
import { Pencil, Plus, Trash } from "lucide-react";
import { RepairManForm } from "../components/repairman-form";

type RepairMan = {
  id: string;
  name: string;
  nationalId?: string | null;
  workshopName?: string | null;
};

type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function RepairManPage() {
  const [repairmen, setRepairmen] = useState<RepairMan[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0, page: 1, limit: 10, totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRepairMan, setEditingRepairMan] = useState<RepairMan | null>(null);

  const fetchRepairMen = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/repairman?page=${pagination.page}&limit=${pagination.limit}`);
      if (!response.ok) throw new Error("فشل في جلب البيانات");
      const data = await response.json();
      setRepairmen(data.repairmen);
      setPagination(data.pagination);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchRepairMen();
  }, [fetchRepairMen]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleAddClick = () => {
    setEditingRepairMan(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (repairMan: RepairMan) => {
    setEditingRepairMan(repairMan);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/repairman/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("فشل في حذف الفني");
      toast.success("تم حذف الفني بنجاح");
      fetchRepairMen();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة فنيي الصيانة</h1>
        <Button onClick={handleAddClick} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> إضافة فني جديد
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الرقم القومي</TableHead>
              <TableHead>اسم الورشة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">جاري التحميل...</TableCell></TableRow>
            ) : repairmen.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center">لا يوجد فنيون</TableCell></TableRow>
            ) : (
              repairmen.map((man) => (
                <TableRow key={man.id}>
                  <TableCell>{man.name}</TableCell>
                  <TableCell>{man.nationalId || 'غير مسجل'}</TableCell>
                  <TableCell>{man.workshopName || 'غير محدد'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(man)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash className="h-4 w-4 text-red-500" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>هل أنت متأكد من رغبتك في حذف هذا الفني؟</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(man.id)} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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
      </div>

      <RepairManForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchRepairMen}
        initialData={editingRepairMan}
      />
    </div>
  );
} 