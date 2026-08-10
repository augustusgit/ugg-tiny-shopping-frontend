import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "tinystore_auth";

const ADMIN_PUBLIC = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

function readAuth(request: NextRequest): {
  role?: string;
  realm?: string;
  token?: string;
} {
  const raw = request.cookies.get(AUTH_COOKIE)?.value;
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw)) as {
      role?: string;
      realm?: string;
      token?: string;
    };
  } catch {
    return {};
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const auth = readAuth(request);

  if (pathname.startsWith("/admin")) {
    if (ADMIN_PUBLIC.has(pathname)) {
      if (auth.token && auth.role === "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    if (!auth.token || auth.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!auth.token || auth.role !== "user") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
