import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { apiSuccess, apiError } from "@/lib/api";
import { getSubscriberByEmail, unsubscribe, verifyUnsubscribeToken } from "@/lib/waitlist";

export async function GET(request: NextRequest) {
	const email = request.nextUrl.searchParams.get("email");
	const token = request.nextUrl.searchParams.get("token");

	if (!email || !token) {
		return apiError("VALIDATION_ERROR", "Email and token are required");
	}

	const { env } = await getCloudflareContext();
	const secret = (env as unknown as Record<string, unknown>).UNSUBSCRIBE_SECRET as string;

	const valid = await verifyUnsubscribeToken(email, token, secret);
	if (!valid) {
		return apiError("VALIDATION_ERROR", "Invalid unsubscribe token");
	}

	const subscriber = await getSubscriberByEmail(email);
	if (!subscriber) {
		return apiError("NOT_FOUND", "Subscriber not found");
	}

	await unsubscribe(email);

	return apiSuccess({ message: "Successfully unsubscribed" });
}
