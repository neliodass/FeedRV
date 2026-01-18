import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const accessToken = request.cookies.get("access_token");
    const refreshToken = request.cookies.get("refresh_token");

    const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
    const isLoginPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup");

    if (isDashboard && !accessToken && !refreshToken) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isLoginPage && (accessToken || refreshToken)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/signup"],
};