import { NextResponse } from "next/server";

type ErrorCode =
	| "VALIDATION_ERROR"
	| "TURNSTILE_FAILED"
	| "DUPLICATE_EMAIL"
	| "DUPLICATE_ACTION"
	| "GIVEAWAY_ENDED"
	| "NOT_FOUND"
	| "UNAUTHORIZED"
	| "INTERNAL_ERROR";

const STATUS_MAP: Record<ErrorCode, number> = {
	VALIDATION_ERROR: 400,
	TURNSTILE_FAILED: 400,
	DUPLICATE_EMAIL: 409,
	DUPLICATE_ACTION: 409,
	GIVEAWAY_ENDED: 410,
	NOT_FOUND: 404,
	UNAUTHORIZED: 401,
	INTERNAL_ERROR: 500,
};

export function apiSuccess(data: unknown, status = 200) {
	return NextResponse.json({ ok: true, data }, { status });
}

export function apiError(code: ErrorCode, message: string) {
	return NextResponse.json(
		{ ok: false, error: { code, message } },
		{ status: STATUS_MAP[code] },
	);
}
