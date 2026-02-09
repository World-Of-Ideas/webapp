import { apiSuccess, apiError } from "@/lib/api";
import { requireAdminSession } from "@/lib/admin-auth";
import { getSeoAudit } from "@/lib/seo";

export async function GET() {
	if (!(await requireAdminSession())) {
		return apiError("UNAUTHORIZED", "Not authenticated");
	}

	const audit = await getSeoAudit();
	return apiSuccess(audit);
}
