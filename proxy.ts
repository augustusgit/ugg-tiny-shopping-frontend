import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "tinystore_auth";

function readAuth(request: NextRequest): { role?: string; token?: string } {
  const raw = request.cookies.get(AUTH_COOKIE)?.value;
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw)) as {
      role?: string;
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
    if (!auth.token) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (auth.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = auth.role === "user" ? "/dashboard" : "/login";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!auth.token) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (auth.role !== "user") {
      const url = request.nextUrl.clone();
      url.pathname = auth.role === "admin" ? "/admin" : "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
