import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { apiSuccess, apiError, clampInt, getClientIp } from "../api";

describe("apiSuccess", () => {
	it("returns JSON with ok: true and data", async () => {
		const response = apiSuccess({ foo: 1 });
		const body = await response.json();
		expect(body).toEqual({ ok: true, data: { foo: 1 } });
		expect(response.status).toBe(200);
	});

	it("supports custom status codes", async () => {
		const response = apiSuccess({}, 201);
		expect(response.status).toBe(201);
	});
});

describe("apiError", () => {
	it("returns NOT_FOUND with 404 status", async () => {
		const response = apiError("NOT_FOUND", "not found");
		const body = await response.json();
		expect(body).toEqual({ ok: false, error: { code: "NOT_FOUND", message: "not found" } });
		expect(response.status).toBe(404);
	});

	it("returns VALIDATION_ERROR with 400 status", async () => {
		const response = apiError("VALIDATION_ERROR", "bad input");
		expect(response.status).toBe(400);
	});

	it("returns DUPLICATE_ACTION with 409 status", async () => {
		const response = apiError("DUPLICATE_ACTION", "already done");
		const body = (await response.json()) as { error: { code: string } };
		expect(body.error.code).toBe("DUPLICATE_ACTION");
		expect(response.status).toBe(409);
	});

	it("returns DUPLICATE_EMAIL with 409 status", async () => {
		const response = apiError("DUPLICATE_EMAIL", "exists");
		expect(response.status).toBe(409);
	});

	it("returns INTERNAL_ERROR with 500 status", async () => {
		const response = apiError("INTERNAL_ERROR", "oops");
		expect(response.status).toBe(500);
	});

	it("returns TURNSTILE_FAILED with 400 status", async () => {
		const response = apiError("TURNSTILE_FAILED", "captcha failed");
		const body = await response.json();
		expect(body).toEqual({
			ok: false,
			error: { code: "TURNSTILE_FAILED", message: "captcha failed" },
		});
		expect(response.status).toBe(400);
	});

	it("returns GIVEAWAY_ENDED with 410 status", async () => {
		const response = apiError("GIVEAWAY_ENDED", "ended");
		const body = await response.json();
		expect(body).toEqual({
			ok: false,
			error: { code: "GIVEAWAY_ENDED", message: "ended" },
		});
		expect(response.status).toBe(410);
	});

	it("returns UNAUTHORIZED with 401 status", async () => {
		const response = apiError("UNAUTHORIZED", "not allowed");
		const body = await response.json();
		expect(body).toEqual({
			ok: false,
			error: { code: "UNAUTHORIZED", message: "not allowed" },
		});
		expect(response.status).toBe(401);
	});

	it("returns RATE_LIMITED with 429 status", async () => {
		const response = apiError("RATE_LIMITED", "slow down");
		const body = await response.json();
		expect(body).toEqual({
			ok: false,
			error: { code: "RATE_LIMITED", message: "slow down" },
		});
		expect(response.status).toBe(429);
	});
});

describe("getClientIp", () => {
	it("returns cf-connecting-ip header value when present", () => {
		const request = new NextRequest("http://localhost", {
			headers: { "cf-connecting-ip": "1.2.3.4" },
		});
		expect(getClientIp(request)).toBe("1.2.3.4");
	});

	it("returns 'unknown' when cf-connecting-ip header is missing", () => {
		const request = new NextRequest("http://localhost");
		expect(getClientIp(request)).toBe("unknown");
	});
});

describe("clampInt", () => {
	it("parses a valid number", () => {
		expect(clampInt("5", 1, 1, 100)).toBe(5);
	});

	it("returns fallback for null", () => {
		expect(clampInt(null, 12, 1, 100)).toBe(12);
	});

	it("returns fallback for NaN", () => {
		expect(clampInt("abc", 12, 1, 100)).toBe(12);
	});

	it("clamps to min", () => {
		expect(clampInt("0", 1, 1, 100)).toBe(1);
		expect(clampInt("-5", 1, 1, 100)).toBe(1);
	});

	it("clamps to max", () => {
		expect(clampInt("999", 1, 1, 100)).toBe(100);
	});

	it("rounds floats", () => {
		expect(clampInt("2.7", 1, 1, 100)).toBe(3);
	});
});
