"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import type { WorkOrder } from "./VehicleFormClient";
import { useState } from "react";
import { FileIcon, ImageIcon, Loader2, TrashIcon, UploadIcon, EyeIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  onChange: (idx: number, field: keyof WorkOrder, value: any) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
}

export default function WorkOrdersTable({ workOrders, onChange, onAdd, onRemove }: WorkOrdersTableProps) {
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [fileUrls, setFileUrls] = useState<{ [key: string]: string }>(() => {
    const urls: { [key: string]: string } = {};
    workOrders.forEach((order, idx) => {
      if (order.file_number_work && order.file_number_work_path) {
        urls[`${idx}-file_number_work`] = order.file_number_work_path;
      }
      if (order.file_examination && order.file_examination_path) {
        urls[`${idx}-file_examination`] = order.file_examination_path;
      }
      if (order.file_check && order.file_check_path) {
        urls[`${idx}-file_check`] = order.file_check_path;
      }
      if (order.file_electronic_invoice && order.file_electronic_invoice_path) {
        urls[`${idx}-file_electronic_invoice`] = order.file_electronic_invoice_path;
      }
    });
    return urls;
  });

  const handleFileUpload = async (file: File, idx: number, fileType: string) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [`${idx}-${fileType}`]: true }));
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workOrderId', workOrders[idx].id || `temp-${idx}`);
      formData.append('fileType', fileType);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('فشل تحميل الملف');

      const data = await response.json();
      onChange(idx, fileType as keyof WorkOrder, data.fileType);
      setFileUrls(prev => ({ ...prev, [`${idx}-${fileType}`]: data.filePath }));
      
    } catch (error) {
      console.error('خطأ في تحميل الملف:', error);
      alert('فشل في تحميل الملف');
    } finally {
      setUploading(prev => ({ ...prev, [`${idx}-${fileType}`]: false }));
    }
  };

  const handleFileDelete = async (idx: number, field: keyof WorkOrder) => {
    const fileUrl = fileUrls[`${idx}-${field}`];
    const workOrder = workOrders[idx];
    if (!fileUrl || !workOrder) return;

    try {
      const requestData = { 
        filePath: fileUrl,
        workOrderId: workOrder.id,
        fileType: field 
      };
      
      console.log('بيانات طلب حذف الملف:', requestData);

      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('استجابة الخادم:', {
        status: response.status,
        ok: response.ok,
        data
      });
      
      if (!response.ok) {
        throw new Error(
          `فشل حذف الملف - الحالة: ${response.status} - التفاصيل: ${JSON.stringify(data)}`
        );
      }

      // تحديث حالة الملف في الواجهة
      onChange(idx, field, null);
      onChange(idx, `${field}_path` as keyof WorkOrder, null);
      setFileUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[`${idx}-${field}`];
        return newUrls;
      });
    } catch (error) {
      console.error('خطأ في حذف الملف:', error);
      alert(error instanceof Error ? error.message : 'فشل في حذف الملف');
    }
  };

  const FileUploadCell = ({ idx, field, label }: { idx: number; field: keyof WorkOrder; label: string }) => {
    const fileUrl = fileUrls[`${idx}-${field}`];
    const fileType = workOrders[idx][field];

    return (
      <TableCell>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            id={`file-${idx}-${field}`}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, idx, field);
            }}
          />
          <label
            htmlFor={`file-${idx}-${field}`}
            className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800"
          >
            {uploading[`${idx}-${field}`] ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : fileType ? (
              fileType === 'PDF' ? (
                <FileIcon className="h-4 w-4" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )
            ) : (
              <UploadIcon className="h-4 w-4" />
            )}
            {label}
          </label>

          {fileType && fileUrl && (
            <div className="flex items-center gap-1">
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="ghost" size="sm">
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>عرض الملف</DialogTitle>
                  </DialogHeader>
                  {fileType === 'PDF' ? (
                    <iframe src={fileUrl} className="w-full h-[80vh]" />
                  ) : (
                    <img src={fileUrl} alt="Preview" className="max-w-full h-auto" />
                  )}
                </DialogContent>
              </Dialog>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleFileDelete(idx, field)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </TableCell>
    );
  };

  return (
    <div className="overflow-x-auto rounded-md border mt-6 w-full">
      <Table className="w-full min-w-[1800px]">
        <TableHeader>
          <TableRow>
            <TableCell>رقم الملف</TableCell>
            <TableCell>نوع الإصلاح</TableCell>
            <TableCell>رقم أمر الشغل</TableCell>
            <TableCell>تاريخ أمر الشغل</TableCell>
            <TableCell>ملف أمر الشغل</TableCell>
            <TableCell>حالة الفحص</TableCell>
            <TableCell>تاريخ الفحص</TableCell>
            <TableCell>ملف الفحص</TableCell>
            <TableCell>سعر الشغل</TableCell>
            <TableCell>حالة السحب</TableCell>
            <TableCell>تاريخ الشيك</TableCell>
            <TableCell>رقم الشيك</TableCell>
            <TableCell>ملف الشيك</TableCell>
            <TableCell>حالة الفاتورة الإلكترونية</TableCell>
            <TableCell>تاريخ الفاتورة الإلكترونية</TableCell>
            <TableCell>رقم الفاتورة الإلكترونية</TableCell>
            <TableCell>ملف الفاتورة</TableCell>
            <TableCell>إجراءات</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((order, idx) => (
            <TableRow key={order.id || idx}>
              <TableCell>
                <Input value={order.File_number || ""} onChange={e => onChange(idx, "File_number", e.target.value)} />
              </TableCell>
              <TableCell>
                <Input value={order.Type_of_repair || ""} onChange={e => onChange(idx, "Type_of_repair", e.target.value)} />
              </TableCell>
              <TableCell>
                <Input value={order.number_work || ""} onChange={e => onChange(idx, "number_work", e.target.value)} />
              </TableCell>
              <TableCell>
                <Input type="date" value={order.date_number_work || ""} onChange={e => onChange(idx, "date_number_work", e.target.value)} />
              </TableCell>
              <FileUploadCell idx={idx} field="file_number_work" label="تحميل ملف" />
              <TableCell>
                <Select value={order.examination_status || "Not_checked"} onValueChange={val => onChange(idx, "examination_status", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Checked">تم الفحص</SelectItem>
                    <SelectItem value="Not_checked">لم يتم الفحص</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input type="date" value={order.examination_date || ""} onChange={e => onChange(idx, "examination_date", e.target.value)} />
              </TableCell>
              <FileUploadCell idx={idx} field="file_examination" label="تحميل ملف" />
              <TableCell>
                <Input type="number" value={order.price_work || ""} onChange={e => onChange(idx, "price_work", e.target.value)} />
              </TableCell>
              <TableCell>
                <Select value={order.Checkstatus || "Not_Withdrawn"} onValueChange={val => onChange(idx, "Checkstatus", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Withdrawn">تم السحب</SelectItem>
                    <SelectItem value="Not_Withdrawn">لم يتم السحب</SelectItem>
                    <SelectItem value="Withdrawn_in_progress">جاري السحب</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input type="date" value={order.Check_date || ""} onChange={e => onChange(idx, "Check_date", e.target.value)} />
              </TableCell>
              <TableCell>
                <Input value={order.Check_number || ""} onChange={e => onChange(idx, "Check_number", e.target.value)} />
              </TableCell>
              
              <FileUploadCell idx={idx} field="file_check" label="تحميل ملف" />
              <TableCell>
                <Select value={order.Electronic_invoice_status || "Not_Done"} onValueChange={val => onChange(idx, "Electronic_invoice_status", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Done">تم</SelectItem>
                    <SelectItem value="Not_Done">لم يتم</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input type="date" value={order.Electronic_invoice_date || ""} onChange={e => onChange(idx, "Electronic_invoice_date", e.target.value)} />
              </TableCell>
              <TableCell>
                <Input value={order.Electronic_invoice_number || ""} onChange={e => onChange(idx, "Electronic_invoice_number", e.target.value)} />
              </TableCell>
              <FileUploadCell idx={idx} field="file_electronic_invoice" label="تحميل ملف" />
              <TableCell>
                <Button type="button" variant="destructive" onClick={() => onRemove(idx)}>حذف</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-end mt-2">
        <Button type="button" onClick={onAdd}>إضافة أمر شغل</Button>
      </div>
    </div>
  );
} 