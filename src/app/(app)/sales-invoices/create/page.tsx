"use client";

import { useEffect, useState } from "react";
import { SalesInvoiceForm } from "@/features/sales-invoice/components/sales-invoice-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/queries/login";

export default function CreateSalesInvoicePage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // استرجاع معلومات المستخدم من التخزين المحلي
    const userInfoStr = localStorage.getItem('userInfo');
    console.log('userRole', userRole);
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUserRole(userInfo.role as UserRole);
      } catch (error) {
        console.error('خطأ في تحليل معلومات المستخدم:', error);
      }
    }
  }, []);

  // التحقق من صلاحيات المستخدم
  if (userRole !== "maintenance" && userRole !== "admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>غير مصرح</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{userRole}</p>
          <p>ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">إنشاء فاتورة مبيعات جديدة</h1>
      <SalesInvoiceForm role="maintenance" mode="create" />
    </div>
  );
}