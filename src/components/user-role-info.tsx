"use client";

import { useEffect, useState } from "react";
import { UserRole } from "@/queries/login";
import { Card, CardContent } from "././ui/card";
import { User, Shield, Warehouse, Wrench } from "lucide-react";

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

export function UserRoleInfo() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // استرجاع معلومات المستخدم من التخزين المحلي
    const userInfoStr = localStorage.getItem('userInfo');
    
    if (userInfoStr) {
      try {
        const parsedInfo = JSON.parse(userInfoStr);
        setUserInfo(parsedInfo as UserInfo);
      } catch (error) {
        console.error('خطأ في تحليل معلومات المستخدم:', error);
        setUserInfo(null);
      }
    }
  }, []);

  if (!userInfo) {
    return null;
  }

  const RoleIcon = roleIcons[userInfo.role];

  return (
    <Card className="mb-4 mx-2 border-l-4 border-l-blue-500">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userInfo.username}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <RoleIcon className="w-3 h-3 text-gray-500" />
              <p className="text-xs text-gray-500">
                {roleTranslations[userInfo.role] || userInfo.role}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}