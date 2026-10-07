import { NextResponse, type NextRequest } from "next/server";

import { decodeToken, getRole, isTokenExpired } from "@/lib/jwt";
import {
  HOME_ROUTE,
  LOGIN_ROUTE,
  TOKEN_COOKIE,
  allowedRoles,
  isAuthPage,
  isPublicRoute,
} from "@/lib/routes";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const decoded = token ? decodeToken(token) : null;
  const role = decoded ? getRole(decoded) : null;
  const valid = Boolean(decoded && role && !isTokenExpired(decoded));

  const redirectTo = (path: string, dropCookie = false) => {
    const response = NextResponse.redirect(new URL(path, request.url));
    if (dropCookie) response.cookies.delete(TOKEN_COOKIE);
    return response;
  };

  if (isPublicRoute(pathname)) {
    if (valid && isAuthPage(pathname)) {
      return redirectTo(HOME_ROUTE);
    }

    const response = NextResponse.next();
    if (token && !valid) response.cookies.delete(TOKEN_COOKIE); 
    return response;
  }

  if (!valid || !role) {
    return redirectTo(LOGIN_ROUTE, Boolean(token));
  }

  const allowed = allowedRoles(pathname);
  if (allowed && !allowed.includes(role)) {
    return redirectTo(HOME_ROUTE);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};