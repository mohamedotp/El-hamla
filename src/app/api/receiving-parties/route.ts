import { NextResponse } from "next/server";
import { ReceivingParty } from "@prisma/client";

export async function GET() {
  try {
    const values = Object.values(ReceivingParty);
    return NextResponse.json(values);
  } catch (error) {
    console.error("Error fetching receiving parties:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الجهات المستلمة" },
      { status: 500 }
    );
  }
}
