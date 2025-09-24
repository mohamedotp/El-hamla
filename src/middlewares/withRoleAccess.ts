import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { CustomMiddleware } from "./chain";
import { jwtVerify } from "jose";
interface JwtPayloadData {
    data?: {
      role?: string;
    };
  }
// تعريف مسارات الوصول حسب الدور
const roleBasedRoutes = {
  admin: ["*"], // المسؤول يمكنه الوصول إلى جميع الصفحات
  warehouse: ["/products", "/", "/sales-invoices/warehouse", "/vehicles"], // المخزن يمكنه الوصول فقط إلى صفحات قطع الغيار والصفحة الرئيسية
  maintenance: ["/add-purchases", "/vehicles", "/", "/sales-invoices/create", "/sales-invoices/maintenance" , "/sales-invoices/details/:id"], // الصيانة يمكنها الوصول إلى صفحات المشتريات والسيارات والصفحة الرئيسية
};

// التحقق مما إذا كان المستخدم لديه حق الوصول إلى المسار المطلوب
function hasAccess(role: string, pathname: string): boolean {
  const allowedRoutes = roleBasedRoutes[role as keyof typeof roleBasedRoutes] || [];
  
  // إذا كان المستخدم مسؤولاً، فلديه حق الوصول إلى جميع الصفحات
  if (role === "admin" || allowedRoutes.includes("*")) {
    return true;
  }
  
  // التحقق من المسار المطلوب
  return allowedRoutes.some(route => pathname.startsWith(route));
}

export default function withRoleAccess(
  middleware: CustomMiddleware,
): CustomMiddleware {
  return async (
    request: NextRequest,
    event: NextFetchEvent,
    response: NextResponse,
  ) => {
    // تخطي التحقق لصفحة تسجيل الدخول والصور
    if (
      request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname.startsWith("/images")
    )
      return middleware(request, event, response);

    const outSiteJWT = request.cookies.get("OutSiteJWT");

    if (!outSiteJWT)
      return NextResponse.redirect(new URL("/login", request.url));

    try {
      // التحقق من الرمز المميز وفك تشفيره
      const { payload } = await jwtVerify<JwtPayloadData>(
        outSiteJWT.value,
        new TextEncoder().encode(process.env.JWT_SECRET),
      );
      
      // استخراج دور المستخدم
      const userRole = payload.data?.role;
      
      const pathname = request.nextUrl.pathname;
      
      // التحقق من حق الوصول
      if (!userRole || !hasAccess(userRole, pathname)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      
    } catch (err) {
      console.error("خطأ في التحقق من الرمز المميز:", err);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return middleware(request, event, response);
  };
}