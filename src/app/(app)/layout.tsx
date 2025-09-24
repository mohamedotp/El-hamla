import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getTabByPathname, Tab } from "@/data/sidebar";
import { headers } from "next/headers";
import { ReactNode } from "react";
import { RoleBasedSidebar } from "@/components/role-based-sidebar";
import { UserInfoHeader } from "@/components/user-info-header";

export default async function Layout({ children }: { children: ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");

  const tab: Tab | undefined = pathname
    ? getTabByPathname(pathname!)
    : undefined;

  return (
    <SidebarProvider>
      <RoleBasedSidebar />
      <div className="w-full h-full flex flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" />
            <h1 className="text-2xl font-bold flex">
              {tab?.heading ?? "غير معروف"}
            </h1>
          </div>
          <UserInfoHeader />
        </div>
        <main className="w-full h-full flex p-4">{children}</main>
      </div>
    </SidebarProvider>
  );
}
