import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper to decode JWT token payload safely in Next.js Edge Runtime
function getRoleFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + "=".repeat(4 - pad) : base64;
    const jsonPayload = atob(paddedBase64);
    const parsed = JSON.parse(jsonPayload);
    return parsed.role || parsed.user?.role || null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const cookieRole = request.cookies.get("userRole")?.value;

  // Extract role from token or cookie fallback
  const tokenRole = accessToken ? getRoleFromToken(accessToken) : null;
  const role = (tokenRole || cookieRole || "").toUpperCase();

  const isAuthenticated = !!accessToken;
  const isAdmin = role === "ADMIN";

  // Protect /admin routes at server edge level
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      // User is authenticated but NOT an admin -> redirect to home page
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Redirect authenticated users away from Auth pages
  if (pathname === "/auth/login" || pathname === "/auth/register") {
    if (isAuthenticated) {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
