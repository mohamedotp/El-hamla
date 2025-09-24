// app/api/users/create/route.ts
import { NextResponse } from "next/server";
import { withValidation } from "@/lib/route-handler-wrapper";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validations/user";
import { StatusCodes } from "http-status-codes";

export const POST = withValidation(createUserSchema, async (_req, body) => {
  try {
    // التحقق من وجود اسم مستخدم مسبقًا
    const existingUser = await prisma.user.findUnique({
      where: { username: body.username },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "اسم المستخدم مستخدم من قبل" },
        { status: StatusCodes.CONFLICT }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await hash(body.password, Number(process.env.SALT) || 10);

    // إنشاء المستخدم الجديد
    const newUser = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        role: body.role,
      },
    });

    return NextResponse.json(
      {
        message: "تم إنشاء المستخدم بنجاح",
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
        },
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("خطأ في إنشاء المستخدم:", error);
    return NextResponse.json(
      { message: "حدث خطأ أثناء إنشاء المستخدم" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
});
