import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/browse/:path*",
    "/coach/:path*",
    "/client/:path*",
    "/dashboard/:path*",
    "/portal/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/privacy/:path*",
    "/terms/:path*",
  ],
};
