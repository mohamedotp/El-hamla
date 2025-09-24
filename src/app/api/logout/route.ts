import { serialize } from "cookie";
import { StatusCodes } from "http-status-codes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookies = request.cookies;

  const outSiteJWT = cookies.get("OutSiteJWT") as {
    name: string;
    value: string;
  };

  const token = outSiteJWT.value;

  const serialized = serialize("OutSiteJWT", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: -1,
    path: "/",
  });

  return NextResponse.json(
    { message: "تم تسجيل الخروج بنجاح" },
    { status: StatusCodes.OK, headers: { "Set-Cookie": serialized } },
  );
}
