import { prisma } from "@/lib/prisma";
import { withValidation } from "@/lib/route-handler-wrapper";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { object, string } from "yup";
import { serialize } from "cookie";
import { StatusCodes } from "http-status-codes";
import { compare } from "bcrypt";

const loginSchema = object({
  username: string().required("اسم المستخدم مطلوب"),
  password: string().required("كلمة المرور مطلوبة"),
});

const MAX_AGE = 60 * 60 * 24 * 7; // 7 أيام

export const POST = withValidation(loginSchema, async (_req, body) => {
  try {
    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { username: body.username },
    });

    if (!user) {
      return NextResponse.json(
        { message: "اسم المستخدم أو كلمة المرور غير صحيحة" },
        { status: StatusCodes.UNAUTHORIZED }
      );
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await compare(body.password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "اسم المستخدم أو كلمة المرور غير صحيحة" },
        { status: StatusCodes.UNAUTHORIZED }
      );
    }

    // إنشاء التوكن
    const iat = Math.floor(Date.now() / 1000);
    const token = await new SignJWT({
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt(iat)
      .setNotBefore(iat)
      .setExpirationTime(`${MAX_AGE}s`)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    // إعداد الكوكي
    const cookie = serialize("OutSiteJWT", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });

    // إرسال الرد
    return NextResponse.json(
      {
        message: "تم تسجيل الدخول بنجاح",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      },
      {
        status: StatusCodes.OK,
        headers: {
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error) {
    console.error("خطأ أثناء تسجيل الدخول:", error);
    return NextResponse.json(
      { message: "حدث خطأ غير متوقع أثناء تسجيل الدخول" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
});
