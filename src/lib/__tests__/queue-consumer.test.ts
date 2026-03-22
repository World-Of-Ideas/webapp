import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EmailJob } from "@/lib/queue";

// Mock resend module
vi.mock("@/lib/resend", () => ({
	sendEmail: vi.fn().mockResolvedValue(undefined),
}));

// Mock subscribers module (for generateUnsubscribeToken)
vi.mock("@/lib/subscribers", () => ({
	generateUnsubscribeToken: vi.fn().mockResolvedValue("mock-unsub-token-abc123"),
}));

import { handleEmailQueue } from "@/lib/queue-consumer";
import { sendEmail } from "@/lib/resend";
import { generateUnsubscribeToken } from "@/lib/subscribers";

// Helper to create a mock Message
function createMockMessage<T>(body: T) {
	return {
		body,
		ack: vi.fn(),
		retry: vi.fn(),
		id: crypto.randomUUID(),
		timestamp: new Date(),
		attempts: 1,
	};
}

// Helper to create a mock MessageBatch
function createMockBatch<T>(messages: ReturnType<typeof createMockMessage<T>>[]) {
	return {
		messages,
		queue: "test-queue",
		ackAll: vi.fn(),
		retryAll: vi.fn(),
	} as unknown as MessageBatch<T>;
}

const mockEnv = {
	SITE_URL: "https://example.com",
	RESEND_API_KEY: "re_test_key",
	FROM_EMAIL: "noreply@example.com",
	CONTACT_EMAIL: "admin@example.com",
	UNSUBSCRIBE_SECRET: "test-secret-123",
} as unknown as CloudflareEnv;

describe("queue-consumer", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- HTML escaping ---

	describe("HTML escaping", () => {
		it("escapes script tags in waitlist confirmation name", async () => {
			const message = createMockMessage<EmailJob>({
				type: "waitlist_confirmation",
				payload: {
					email: "test@example.com",
					name: '<script>alert("xss")</script>',
					position: 5,
					referralCode: "abc123",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			expect(sendEmail).toHaveBeenCalledOnce();
			const callArgs = vi.mocked(sendEmail).mock.calls[0];
			const html = callArgs[1].html;

			expect(html).toContain("&lt;script&gt;");
			expect(html).toContain("&lt;/script&gt;");
			expect(html).not.toContain("<script>");
		});

		it("escapes HTML in contact receipt fields", async () => {
			const message = createMockMessage<EmailJob>({
				type: "contact_receipt",
				payload: {
					name: "Bob <b>Bold</b>",
					email: 'test@"evil.com',
					message: "Hello & <goodbye>",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			expect(sendEmail).toHaveBeenCalledOnce();
			const html = vi.mocked(sendEmail).mock.calls[0][1].html;

			expect(html).toContain("Bob &lt;b&gt;Bold&lt;/b&gt;");
			expect(html).toContain("test@&quot;evil.com");
			expect(html).toContain("Hello &amp; &lt;goodbye&gt;");
		});
	});

	// --- Unsubscribe URL ---

	describe("unsubscribe headers", () => {
		it("includes properly encoded email and token in unsubscribe URL", async () => {
			const message = createMockMessage<EmailJob>({
				type: "waitlist_confirmation",
				payload: {
					email: "user+special@example.com",
					name: "Test User",
					position: 1,
					referralCode: "ref123",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			expect(sendEmail).toHaveBeenCalledOnce();
			const headers = vi.mocked(sendEmail).mock.calls[0][1].headers;

			expect(headers).toBeDefined();
			expect(headers!["List-Unsubscribe"]).toContain(
				encodeURIComponent("user+special@example.com"),
			);
			expect(headers!["List-Unsubscribe"]).toContain(
				encodeURIComponent("mock-unsub-token-abc123"),
			);
			expect(headers!["List-Unsubscribe"]).toContain("https://example.com/api/unsubscribe");
			expect(headers!["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
		});

		it("calls generateUnsubscribeToken with correct email and secret", async () => {
			const message = createMockMessage<EmailJob>({
				type: "referral_notification",
				payload: {
					email: "referrer@example.com",
					name: "Referrer",
					newPosition: 2,
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			expect(generateUnsubscribeToken).toHaveBeenCalledWith(
				"referrer@example.com",
				"test-secret-123",
			);
		});
	});

	// --- Email types and subject lines ---

	describe("email types", () => {
		it("waitlist_confirmation has correct subject", async () => {
			const message = createMockMessage<EmailJob>({
				type: "waitlist_confirmation",
				payload: {
					email: "test@example.com",
					name: "Alice",
					position: 42,
					referralCode: "alice42",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			const callArgs = vi.mocked(sendEmail).mock.calls[0][1];
			expect(callArgs.subject).toBe("You're on the waitlist!");
			expect(callArgs.from).toBe("noreply@example.com");
			expect(callArgs.to).toBe("test@example.com");
			expect(callArgs.html).toContain("#42");
		});

		it("referral_notification has correct subject and content", async () => {
			const message = createMockMessage<EmailJob>({
				type: "referral_notification",
				payload: {
					email: "referrer@example.com",
					name: "Bob",
					newPosition: 3,
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			const callArgs = vi.mocked(sendEmail).mock.calls[0][1];
			expect(callArgs.subject).toBe("A friend joined via your referral!");
			expect(callArgs.html).toContain("#3");
			expect(callArgs.html).toContain("Hi Bob");
		});

		it("giveaway_confirmation has correct subject and unsubscribe headers", async () => {
			const message = createMockMessage<EmailJob>({
				type: "giveaway_confirmation",
				payload: { email: "winner@example.com" },
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			const callArgs = vi.mocked(sendEmail).mock.calls[0][1];
			expect(callArgs.subject).toBe("You're entered in the giveaway!");
			expect(callArgs.to).toBe("winner@example.com");
			expect(callArgs.headers).toBeDefined();
			expect(callArgs.headers!["List-Unsubscribe"]).toContain("winner%40example.com");
		});

		it("contact_receipt sends to CONTACT_EMAIL with correct subject", async () => {
			const message = createMockMessage<EmailJob>({
				type: "contact_receipt",
				payload: {
					name: "Charlie",
					email: "charlie@example.com",
					message: "Hello, I have a question.",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			const callArgs = vi.mocked(sendEmail).mock.calls[0][1];
			expect(callArgs.subject).toBe("New contact form submission from Charlie");
			expect(callArgs.to).toBe("admin@example.com"); // CONTACT_EMAIL
			expect(callArgs.html).toContain("Hello, I have a question.");
		});
	});

	// --- Unknown email types ---

	describe("unknown email types", () => {
		it("retries unknown job types without sending email", async () => {
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const message = createMockMessage({
				type: "unknown_type",
				payload: {},
			} as unknown as EmailJob);

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			expect(sendEmail).not.toHaveBeenCalled();
			expect(message.retry).toHaveBeenCalled();
			// Verify generic log message without leaking the type value
			expect(consoleSpy).toHaveBeenCalledWith("Unknown email job type encountered");
			consoleSpy.mockRestore();
		});
	});

	// --- Error handling ---

	describe("error handling", () => {
		it("retries message when sendEmail throws", async () => {
			vi.mocked(sendEmail).mockRejectedValueOnce(new Error("API failure"));

			const message = createMockMessage<EmailJob>({
				type: "giveaway_confirmation",
				payload: { email: "test@example.com" },
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			expect(message.retry).toHaveBeenCalled();
			expect(message.ack).not.toHaveBeenCalled();
		});
	});

	// --- Remaining email types (previously uncovered) ---

	describe("waitlist_admin_notification", () => {
		it("sends notification to CONTACT_EMAIL with subscriber details", async () => {
			const message = createMockMessage<EmailJob>({
				type: "waitlist_admin_notification",
				payload: {
					email: "newuser@example.com",
					name: "New User",
					position: 15,
					source: "twitter",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			expect(sendEmail).toHaveBeenCalledOnce();
			const callArgs = vi.mocked(sendEmail).mock.calls[0][1];
			expect(callArgs.to).toBe("admin@example.com");
			expect(callArgs.subject).toContain("New waitlist signup");
			expect(callArgs.html).toContain("New User");
			expect(callArgs.html).toContain("newuser@example.com");
			expect(callArgs.html).toContain("#15");
			expect(callArgs.html).toContain("twitter");
			// Admin notifications have no unsubscribe headers
			expect(callArgs.headers).toBeUndefined();
			expect(message.ack).toHaveBeenCalled();
		});

		it("omits source line when source is undefined", async () => {
			const message = createMockMessage<EmailJob>({
				type: "waitlist_admin_notification",
				payload: {
					email: "user@example.com",
					name: "User",
					position: 1,
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			const html = vi.mocked(sendEmail).mock.calls[0][1].html;
			expect(html).not.toContain("Source");
		});

		it("escapes HTML in admin notification fields", async () => {
			const message = createMockMessage<EmailJob>({
				type: "waitlist_admin_notification",
				payload: {
					email: "user@example.com",
					name: '<img src=x onerror=alert(1)>',
					position: 1,
					source: "<script>xss</script>",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			const callArgs = vi.mocked(sendEmail).mock.calls[0][1];
			expect(callArgs.html).not.toContain("<img");
			expect(callArgs.html).not.toContain("<script>");
			expect(callArgs.html).toContain("&lt;img");
			expect(callArgs.subject).toContain("&lt;img");
		});
	});

	describe("campaign_email", () => {
		it("sends campaign with unsubscribe headers", async () => {
			const message = createMockMessage<EmailJob>({
				type: "campaign_email",
				payload: {
					to: "subscriber@example.com",
					subject: "Newsletter Issue #1",
					html: "<h1>Welcome</h1><p>Newsletter content</p>",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			expect(sendEmail).toHaveBeenCalledOnce();
			const callArgs = vi.mocked(sendEmail).mock.calls[0][1];
			expect(callArgs.to).toBe("subscriber@example.com");
			expect(callArgs.subject).toBe("Newsletter Issue #1");
			expect(callArgs.html).toBe("<h1>Welcome</h1><p>Newsletter content</p>");
			expect(callArgs.headers).toBeDefined();
			expect(callArgs.headers!["List-Unsubscribe"]).toContain("https://example.com/api/unsubscribe");
			expect(callArgs.headers!["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
			expect(message.ack).toHaveBeenCalled();
		});

		it("generates unsubscribe token for campaign recipient", async () => {
			const message = createMockMessage<EmailJob>({
				type: "campaign_email",
				payload: {
					to: "cam@example.com",
					subject: "Test",
					html: "<p>Test</p>",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			expect(generateUnsubscribeToken).toHaveBeenCalledWith(
				"cam@example.com",
				"test-secret-123",
			);
		});
	});

	describe("email_verification", () => {
		it("sends verification email with prefixed token", async () => {
			const message = createMockMessage<EmailJob>({
				type: "email_verification",
				payload: {
					email: "pending@example.com",
					name: "Pending User",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			expect(sendEmail).toHaveBeenCalledOnce();
			const callArgs = vi.mocked(sendEmail).mock.calls[0][1];
			expect(callArgs.to).toBe("pending@example.com");
			expect(callArgs.subject).toBe("Verify your email to complete your signup");
			expect(callArgs.html).toContain("Hi Pending User");
			expect(callArgs.html).toContain("Verify Email");
			expect(callArgs.html).toContain("https://example.com/api/verify-email");
			// No unsubscribe headers on verification emails
			expect(callArgs.headers).toBeUndefined();
			expect(message.ack).toHaveBeenCalled();
		});

		it("uses verify: prefix for token generation", async () => {
			const message = createMockMessage<EmailJob>({
				type: "email_verification",
				payload: {
					email: "verify@example.com",
					name: "Verifier",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			expect(generateUnsubscribeToken).toHaveBeenCalledWith(
				"verify:verify@example.com",
				"test-secret-123",
			);
		});

		it("escapes HTML in verification email name", async () => {
			const message = createMockMessage<EmailJob>({
				type: "email_verification",
				payload: {
					email: "test@example.com",
					name: '<b>Bold</b> & "quoted"',
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			const html = vi.mocked(sendEmail).mock.calls[0][1].html;
			expect(html).toContain("&lt;b&gt;Bold&lt;/b&gt; &amp; &quot;quoted&quot;");
			expect(html).not.toContain("<b>Bold</b>");
		});
	});

	// --- Newsletter email types ---

	describe("newsletter_confirmation", () => {
		it("sends confirmation with unsubscribe headers", async () => {
			const message = createMockMessage<EmailJob>({
				type: "newsletter_confirmation",
				payload: {
					email: "subscriber@example.com",
					name: "New Subscriber",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			expect(sendEmail).toHaveBeenCalledOnce();
			const callArgs = vi.mocked(sendEmail).mock.calls[0][1];
			expect(callArgs.to).toBe("subscriber@example.com");
			expect(callArgs.subject).toBe("Thanks for subscribing!");
			expect(callArgs.html).toContain("Hi New Subscriber");
			expect(callArgs.headers).toBeDefined();
			expect(callArgs.headers!["List-Unsubscribe"]).toContain("https://example.com/api/unsubscribe");
			expect(callArgs.headers!["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
			expect(message.ack).toHaveBeenCalled();
		});

		it("escapes HTML in newsletter confirmation name", async () => {
			const message = createMockMessage<EmailJob>({
				type: "newsletter_confirmation",
				payload: {
					email: "test@example.com",
					name: '<script>alert("xss")</script>',
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			const html = vi.mocked(sendEmail).mock.calls[0][1].html;
			expect(html).toContain("&lt;script&gt;");
			expect(html).not.toContain("<script>");
		});
	});

	describe("newsletter_admin_notification", () => {
		it("sends notification to CONTACT_EMAIL with subscriber details", async () => {
			const message = createMockMessage<EmailJob>({
				type: "newsletter_admin_notification",
				payload: {
					email: "newuser@example.com",
					name: "New User",
					source: "twitter",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			expect(sendEmail).toHaveBeenCalledOnce();
			const callArgs = vi.mocked(sendEmail).mock.calls[0][1];
			expect(callArgs.to).toBe("admin@example.com");
			expect(callArgs.subject).toContain("New newsletter subscriber");
			expect(callArgs.html).toContain("New User");
			expect(callArgs.html).toContain("newuser@example.com");
			expect(callArgs.html).toContain("twitter");
			// Admin notifications have no unsubscribe headers
			expect(callArgs.headers).toBeUndefined();
			expect(message.ack).toHaveBeenCalled();
		});

		it("omits source line when source is undefined", async () => {
			const message = createMockMessage<EmailJob>({
				type: "newsletter_admin_notification",
				payload: {
					email: "user@example.com",
					name: "User",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			const html = vi.mocked(sendEmail).mock.calls[0][1].html;
			expect(html).not.toContain("Source");
		});

		it("escapes HTML in admin notification fields", async () => {
			const message = createMockMessage<EmailJob>({
				type: "newsletter_admin_notification",
				payload: {
					email: "user@example.com",
					name: '<img src=x onerror=alert(1)>',
					source: "<script>xss</script>",
				},
			});

			const batch = createMockBatch([message]);
			await handleEmailQueue(batch, mockEnv);

			const callArgs = vi.mocked(sendEmail).mock.calls[0][1];
			expect(callArgs.html).not.toContain("<img");
			expect(callArgs.html).not.toContain("<script>");
			expect(callArgs.html).toContain("&lt;img");
			expect(callArgs.subject).toContain("&lt;img");
		});
	});

	// --- Multiple messages in batch ---

	describe("batch processing", () => {
		it("processes multiple messages in a batch", async () => {
			const msg1 = createMockMessage<EmailJob>({
				type: "giveaway_confirmation",
				payload: { email: "a@example.com" },
			});
			const msg2 = createMockMessage<EmailJob>({
				type: "giveaway_confirmation",
				payload: { email: "b@example.com" },
			});

			const batch = createMockBatch([msg1, msg2]);
			await handleEmailQueue(batch, mockEnv);

			expect(sendEmail).toHaveBeenCalledTimes(2);
			expect(msg1.ack).toHaveBeenCalled();
			expect(msg2.ack).toHaveBeenCalled();
		});
	});
});
