import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  const isLoginPage = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");
  const isProtectedPage = pathname.startsWith("/admin") && !isLoginPage;

  const isWriteApi =
    pathname.startsWith("/api/cars") &&
    ["POST", "PUT", "DELETE", "PATCH"].includes(method);
  const isUploadApi = pathname.startsWith("/api/upload");

  // These routes accept public POSTs (enquiry / booking / financing forms)
  // but their GET (list) is for the dealer panel only.
  const isDealerReadOnlyApi =
    (pathname.startsWith("/api/enquiries") && method === "GET") ||
    (pathname.startsWith("/api/test-drives") && (method === "GET" || method === "PATCH")) ||
    (pathname.startsWith("/api/financing") && method === "GET");

  const needsAuth = isProtectedPage || isWriteApi || isUploadApi || isDealerReadOnlyApi;
  if (!needsAuth || isAdminApi) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/cars/:path*",
    "/api/upload/:path*",
    "/api/enquiries/:path*",
    "/api/test-drives/:path*",
    "/api/financing/:path*",
  ],
};
