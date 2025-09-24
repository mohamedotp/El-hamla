import { NextResponse } from "next/server";
import { Units } from "@prisma/client";

export async function GET() {
  try {
    const values = Object.values(Units);
    return NextResponse.json(values);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الوحدات" },
      { status: 500 }
    );
  }
}
