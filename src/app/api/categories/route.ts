import { NextResponse } from "next/server";
import { Categories } from "@prisma/client";

export async function GET() {
  try {
    const values = Object.values(Categories);
    return NextResponse.json(values);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب التصنيفات" },
      { status: 500 }
    );
  }
}
