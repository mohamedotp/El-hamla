import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";

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