import { cookies } from "next/headers";
import { validateSession } from "./admin";

export async function requireAdminSession(): Promise<boolean> {
	const cookieStore = await cookies();
	const sessionId = cookieStore.get("admin_session")?.value;
	if (!sessionId) return false;
	return validateSession(sessionId);
}
