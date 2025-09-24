"use client";

import { useEffect, useState } from "react";
import { UserRole } from "@/queries/login";
import { User, Shield, Warehouse, Wrench } from "lucide-react";
import { Badge } from "./ui/badge";

interface UserInfo {
  username: string;
  role: UserRole;
  id: string;
}

// ترجمة أسماء الأدوار إلى العربية
const roleTranslations: Record<UserRole, string> = {
  admin: "المسؤول",
  warehouse: "المخزن",
  maintenance: "الصيانة"
};

// أيقونات الأدوار
const roleIcons: Record<UserRole, React.ComponentType<any>> = {
  admin: Shield,
  warehouse: Warehouse,
  maintenance: Wrench
};

// ألوان الأدوار
const roleColors: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-800",
  warehouse: "bg-blue-100 text-blue-800",
  maintenance: "bg-green-100 text-green-800"
};

export function UserInfoHeader() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        const parsedInfo = JSON.parse(userInfoStr);
        setUserInfo(parsedInfo as UserInfo);
      } catch (error) {
        console.error('خطأ في تحليل معلومات المستخدم:', error);
      }
    }
  }, []);

  if (!userInfo) {
    return null;
  }

  const RoleIcon = roleIcons[userInfo.role];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-900">
            {userInfo.username}
          </p>
        </div>
      </div>
      <Badge className={`${roleColors[userInfo.role]} flex items-center gap-1`}>
        <RoleIcon className="w-3 h-3" />
        {roleTranslations[userInfo.role]}
      </Badge>
    </div>
  );
} 