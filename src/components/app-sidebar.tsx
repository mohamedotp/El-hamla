"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { groups } from "@/data/sidebar";
import { logout } from "@/queries/logout";
import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { UserRole } from "@/queries/login";

import { Group } from "@/data/sidebar";

interface UserInfo {
  username: string;
  role: UserRole;
  id: string;
}

type AppSidebarProps = {
  groups: Group[];
};

export function AppSidebar({ groups }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
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

  return (
    <Sidebar side="right">

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-sm">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.tabs.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={pathname === item.url}
                      size="lg"
                      asChild
                    >
                      <a href={item.url}>
                        <item.icon size={20} weight="bold" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          size="lg"
          className="bg-red-200 hover:bg-red-300"
          onClick={async () => {
            try {
              const data = await logout();
              toast.success(data.data.message);
              router.replace("/login");
            } catch (err) {
              toast.error("حدث خطأ!", {
                // eslint-disable-next-line
                description: (err as Record<string, any>)?.response?.data
                  ?.message,
              });
            }
          }}
        >
          <SignOut size={20} weight="bold" />
          تسجيل خروج
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
