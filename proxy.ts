import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAMES = ["accessToken", "refreshToken"] as const;

const hasAuthCookie = (request: NextRequest) =>
  AUTH_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));

export function proxy(request: NextRequest) {
  if (hasAuthCookie(request)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (nextPath && nextPath !== "/login") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/profile", "/profile/edit"],
};
