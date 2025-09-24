"use client";

import { useEffect, useState } from "react";
import { Group, getGroupsByRole } from "@/data/sidebar";
import { UserRole } from "@/queries/login";
import { AppSidebar } from "./app-sidebar";
import { UserRoleInfo } from "./user-role-info";

export function RoleBasedSidebar() {
  const [sidebarGroups, setSidebarGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // استرجاع معلومات المستخدم من التخزين المحلي
    const userInfoStr = localStorage.getItem('userInfo');
    
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        // الحصول على مجموعات الشريط الجانبي بناءً على دور المستخدم
        const groups = getGroupsByRole(userInfo.role as UserRole);
        setSidebarGroups(groups);
      } catch (error) {
        console.error('خطأ في تحليل معلومات المستخدم:', error);
        // في حالة وجود خطأ، استخدم المجموعات الافتراضية
        setSidebarGroups([]);
      }
    } else {
      // إذا لم يتم العثور على معلومات المستخدم، استخدم المجموعات الافتراضية
      setSidebarGroups([]);
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="p-4">جاري التحميل...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <UserRoleInfo />
      <AppSidebar groups={sidebarGroups} />
    </div>
  );
}