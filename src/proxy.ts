import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check for redirects on public pages only
	if (!pathname.startsWith("/admin") && !pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
		try {
			const { getRedirectByPath } = await import("@/lib/redirects");
			const redirect = await getRedirectByPath(pathname);
			if (redirect) {
				const destination = redirect.toUrl.startsWith("/")
					? new URL(redirect.toUrl, request.url)
					: redirect.toUrl;
				return NextResponse.redirect(destination, redirect.statusCode);
			}
		} catch {
			// Continue if redirect lookup fails
		}
	}

	// Admin route protection (first line of defense — routes still validate sessions)
	const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin";
	const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

	if (isAdminPage || isAdminApi) {
		const sessionCookie = request.cookies.get("admin_session");
		const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		if (!sessionCookie?.value || !UUID_RE.test(sessionCookie.value)) {
			if (isAdminApi) {
				return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
			}
			return NextResponse.redirect(new URL("/admin", request.url));
		}
	}

	// Forward x-pathname as a request header so server components can read it
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-pathname", pathname);

	return NextResponse.next({
		request: { headers: requestHeaders },
	});
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|css|js|map)$).*)",
	],
};
