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
		const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		if (!sessionCookie?.value || !UUID_RE.test(sessionCookie.value)) {
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
