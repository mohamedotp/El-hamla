import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { CustomMiddleware } from "./chain";
import { jwtVerify } from "jose";
import { JWTExpired, JWTInvalid } from "jose/errors";

export default function withAuth(
  middleware: CustomMiddleware,
): CustomMiddleware {
  return async (
    request: NextRequest,
    event: NextFetchEvent,
    response: NextResponse,
  ) => {
    if (
      request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname.startsWith("/images")
    )
      return middleware(request, event, response);

    const outSiteJWT = request.cookies.get("OutSiteJWT");

    if (!outSiteJWT)
      return NextResponse.redirect(new URL("/login", request.url));

    try {
      const { payload, protectedHeader } = await jwtVerify(
        outSiteJWT.value,
        new TextEncoder().encode(process.env.JWT_SECRET),
      );
      console.log("PAYLOAD", payload);
      console.log("PROTECTED_HEADER", protectedHeader);
    } catch (err) {
      if (err instanceof JWTExpired)
        return NextResponse.redirect(new URL("/?error=expired", request.url));

      if (err instanceof JWTInvalid)
        return NextResponse.redirect(new URL("/?error=invalid", request.url));

      console.log(err);

      return NextResponse.redirect(new URL("/", request.url));
    }

    return middleware(request, event, response);
  };
}
