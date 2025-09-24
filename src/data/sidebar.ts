import { Icon } from "@phosphor-icons/react/dist/lib/types";
import { ShoppingCart, NewspaperClipping, Gear, Package, Users, Invoice, Receipt, ClipboardText, CheckSquare, Wrench } from "@phosphor-icons/react/dist/ssr";
import { UserRole } from "@/queries/login";

export type Tab = {
  title: string;
  heading: string;
  url: string;
  icon: Icon;
  roles?: UserRole[]; // الأدوار المسموح لها بالوصول إلى هذه الصفحة
};

export interface Group {
  label: string;
  tabs: Tab[];
}

// تعريف جميع علامات التبويب المتاحة
export const allTabs: Group[] = [
  {
    label: "الإدارة",
    tabs: [
      {
        title: "لوحة التحكم",
        heading: "لوحة التحكم",
        url: "/",
        icon: Gear,
        roles: ["admin", "warehouse", "maintenance"],
      },
      {
        title: "إدارة المستخدمين",
        heading: "إدارة المستخدمين",
        url: "/users",
        icon: Users,
        roles: ["admin"],
      },
      {
        title: "الموافقة على فواتير المبيعات",
        heading: "الموافقة على فواتير المبيعات",
        url: "/sales-invoices/admin",
        icon: CheckSquare,
        roles: ["admin"],
      },
    ],
  },
  {
    label: "المخزن",
    tabs: [
      {
        title: "قطع الغيار",
        heading: "قطع الغيار",
        url: "/products",
        icon: Package,
        roles: ["admin", "warehouse"],
      },
      {
        title: "فواتير المشتريات",
        heading: "فواتير المشتريات",
        url: "/purchases",
        icon: Invoice,
        roles: ["admin", "warehouse"],
      },
      {
        title: "صرف فواتير المبيعات",
        heading: "صرف فواتير المبيعات",
        url: "/sales-invoices/warehouse",
        icon: Receipt,
        roles: ["admin", "warehouse"],
      },
      {
        title: "فواتير المبيعات",
        heading: "فواتير المبيعات",
        url: "/sales-invoices/warehouse",
        icon: Receipt,
        roles: ["admin", "warehouse"],
      },
      {
        title: "عرض السيارات",
        heading: "عرض السيارات",
        url: "/vehicles",
        icon: NewspaperClipping,
        roles: ["admin", "warehouse"],
      },
      {
        title: "إدارة فنيي الصيانة",
        heading: "إدارة فنيي الصيانة",
        url: "/repairman",
        icon: Wrench,
        roles: ["admin", "warehouse"],
      }
    ],
  },
  {
    label: "الصيانة",
    tabs: [
      {
        title: "إضافة مشتريات",
        heading: "إضافة مشتريات",
        url: "/add-purchases",
        icon: ShoppingCart,
        roles: ["admin", "maintenance"],
      },
      {
        title: "عرض السيارات",
        heading: "عرض السيارات",
        url: "/vehicles",
        icon: NewspaperClipping,
        roles: ["admin", "maintenance"],
      },
      {
        title: "إنشاء فاتورة مبيعات",
        heading: "إنشاء فاتورة مبيعات",
        url: "/sales-invoices/create",
        icon: ClipboardText,
        roles: ["admin", "maintenance"],
      },
     
    ],
  },
];

// الحصول على مجموعات التبويب المتاحة للمستخدم بناءً على دوره
export function getGroupsByRole(role: UserRole): Group[] {
  // إذا كان المستخدم مسؤولاً، فيمكنه الوصول إلى جميع علامات التبويب
  if (role === "admin") {
    return allTabs;
  }
  
  // تصفية المجموعات والعلامات بناءً على دور المستخدم
  return allTabs
    .map(group => ({
      ...group,
      tabs: group.tabs.filter(tab => !tab.roles || tab.roles.includes(role))
    }))
    .filter(group => group.tabs.length > 0); // إزالة المجموعات الفارغة
}

// الحصول على مجموعات التبويب الافتراضية (للمستخدمين غير المسجلين)
export const groups: Group[] = allTabs;

export function getTabByPathname(pathname: string): Tab | undefined {
  return allTabs
    .find((group) => {
      return group.tabs.findIndex((tab) => tab.url === pathname) !== -1;
    })
    ?.tabs.find((tab) => tab.url === pathname);
}
