import { prisma } from "@/lib/prisma";
import { withValidation } from "@/lib/route-handler-wrapper";
import { StatusCodes } from "http-status-codes";
import { NextRequest, NextResponse } from "next/server";
import { InferType, object, string } from "yup";

const schema = object({
  name: string().required().label("إمس المورد"),
});

export const POST = withValidation(schema, async (req: NextRequest) => {
  try {
    const data: InferType<typeof schema> = await req.json();

    await prisma.supplier.create({
      data: {
        name: data.name,
      },
    });

    return NextResponse.json(
      { message: "تم إنشاء المورد بنجاح" },
      { status: StatusCodes.OK },
    );
  } catch (err) {
    console.log("ERROR", err);

    return NextResponse.json(
      {
        message: "حدث خطأ ما، الرجاء التحقق من السيرفر",
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});

export const GET = async (req: NextRequest) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(suppliers, { status: StatusCodes.OK });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { message: "فشل في جلب بيانات الموردين" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
};
