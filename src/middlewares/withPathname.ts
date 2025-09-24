import { NextRequest, NextResponse } from "next/server";
import { CustomMiddleware } from "./chain";

export default function withPathname(): CustomMiddleware {
  return async (request: NextRequest) => {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", request.nextUrl.pathname);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  };
}
