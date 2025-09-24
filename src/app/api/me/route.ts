// /pages/api/me.ts

import { NextResponse } from "next/server";

export async function GET() {
  // هنا يجب أن تعتمد على الجلسة أو التوكن أو الكوكي لتحديد المستخدم الحالي
  // مثال (إذا كنت تستخدم cookies/session):
  const user = { id: "123", name: "Ahmed" }; // استبدل بهذا من session أو auth system
  return NextResponse.json(user, { status: 200 });
}
