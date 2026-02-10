import { describe, it, expect, vi } from "vitest";

// vi.hoisted runs before vi.mock hoisting — safe to reference in factory
const { mockCookieStore, mockValidateSession } = vi.hoisted(() => {
	const mockCookieStore = {
		get: vi.fn() as ReturnType<typeof vi.fn>,
	};
	const mockValidateSession = vi.fn() as ReturnType<typeof vi.fn>;
	return { mockCookieStore, mockValidateSession };
});

vi.mock("next/headers", () => ({
	cookies: () => Promise.resolve(mockCookieStore),
}));

vi.mock("@/lib/admin", () => ({
	validateSession: mockValidateSession,
}));

import { requireAdminSession } from "../admin-auth";

describe("requireAdminSession", () => {
	it("returns false when no admin_session cookie is present", async () => {
		mockCookieStore.get.mockReturnValue(undefined);
		const result = await requireAdminSession();
		expect(result).toBe(false);
	});

	it("returns false when cookie is present but validateSession returns false", async () => {
		mockCookieStore.get.mockReturnValue({ value: "some-session-id" });
		mockValidateSession.mockResolvedValue(false);
		const result = await requireAdminSession();
		expect(result).toBe(false);
		expect(mockValidateSession).toHaveBeenCalledWith("some-session-id");
	});

	it("returns true when cookie is present and validateSession returns true", async () => {
		mockCookieStore.get.mockReturnValue({ value: "valid-session-id" });
		mockValidateSession.mockResolvedValue(true);
		const result = await requireAdminSession();
		expect(result).toBe(true);
		expect(mockValidateSession).toHaveBeenCalledWith("valid-session-id");
	});
});
