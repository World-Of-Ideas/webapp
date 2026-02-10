import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const response = NextResponse.next();

	// Set x-pathname header for layout detection
	response.headers.set("x-pathname", pathname);

	// Admin route protection (first line of defense — routes still validate sessions)
	const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
	const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

	if (isAdminPage || isAdminApi) {
		const sessionCookie = request.cookies.get("admin_session");
		if (!sessionCookie?.value) {
			if (isAdminApi) {
				return NextResponse.json({ error: "UNAUTHORIZED", message: "Not authenticated" }, { status: 401 });
			}
			return NextResponse.redirect(new URL("/admin/login", request.url));
		}
	}

	return response;
}

export const config = {
	matcher: ["/admin/:path*", "/api/admin/:path*"],
};
