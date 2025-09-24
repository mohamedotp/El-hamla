"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type RepairMan = {
  id: string;
  name: string;
  nationalId?: string | null;
  workshopName?: string | null;
};

interface RepairManFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  initialData?: RepairMan | null;
}

export function RepairManForm({
  isOpen,
  onOpenChange,
  onSuccess,
  initialData,
}: RepairManFormProps) {
  const [name, setName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setNationalId(initialData.nationalId || "");
      setWorkshopName(initialData.workshopName || "");
    } else {
      setName("");
      setNationalId("");
      setWorkshopName("");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const url = isEditMode ? `/api/repairman/${initialData?.id}` : "/api/repairman";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nationalId, workshopName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "فشل في حفظ البيانات");
      }

      toast.success(isEditMode ? "تم تعديل الفني بنجاح" : "تمت إضافة الفني بنجاح");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "تعديل فني صيانة" : "إضافة فني صيانة جديد"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">اسم الفني</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="nationalId">الرقم القومي (اختياري)</Label>
            <Input
              id="nationalId"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="workshopName">اسم الورشة</Label>
            <Input
              id="workshopName"
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">إلغاء</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 