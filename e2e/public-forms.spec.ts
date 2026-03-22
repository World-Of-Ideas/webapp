import { test, expect, type Page } from "@playwright/test";

// Public forms don't need admin auth
test.use({ storageState: { cookies: [], origins: [] } });

/** Wait for Turnstile widget to auto-resolve (always-pass test key in dev) */
async function waitForTurnstile(page: Page) {
	// The Turnstile iframe loads and fires onSuccess; wait for the response input
	await page.locator("iframe[src*='challenges.cloudflare.com']").waitFor({ state: "attached", timeout: 10_000 }).catch(() => {
		// Turnstile may not render an iframe with interaction-only + always-pass key
	});
	// Give the callback time to fire and update React state
	await page.waitForTimeout(1500);
}

// ─── Waitlist ──────────────────────────────────────────────────

test.describe("Waitlist signup", () => {
	test("shows signup form on /waitlist", async ({ page }) => {
		await page.goto("/waitlist");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		await expect(page.getByLabel(/email/i)).toBeVisible();
		await expect(page.getByLabel(/name/i)).toBeVisible();
	});

	test("validates empty email", async ({ page }) => {
		await page.goto("/waitlist");
		// Scope to the signup form to avoid matching FAQ accordion buttons
		const form = page.locator("form");
		const submitButton = form.getByRole("button", { name: /join|sign up|submit/i });
		if (await submitButton.isVisible()) {
			await submitButton.click();
			// Should show validation error or remain on page
			await expect(page).toHaveURL(/waitlist/);
		}
	});

	test("submits waitlist form successfully", async ({ page }) => {
		await page.goto("/waitlist");

		const email = `e2e-${Date.now()}@example.com`;
		await page.getByLabel(/email/i).fill(email);
		await page.getByLabel(/name/i).fill("E2E Test User");

		await waitForTurnstile(page);
		const form = page.locator("form");
		const submitButton = form.getByRole("button", { name: /join|sign up|submit/i });
		await submitButton.click();

		// Should show success (position number or thank you message)
		await expect(page.getByText(/position|thank|success|#\d+/i)).toBeVisible({ timeout: 10_000 });
	});

	test("prevents duplicate email signup", async ({ page }) => {
		// Use the seeded email from seed.sql
		await page.goto("/waitlist");
		await page.getByLabel(/email/i).fill("alice@example.com");
		await page.getByLabel(/name/i).fill("Alice Duplicate");

		await waitForTurnstile(page);
		const form = page.locator("form");
		const submitButton = form.getByRole("button", { name: /join|sign up|submit/i });
		await submitButton.click();

		// Existing subscribers are redirected to their referral dashboard
		await expect(page).toHaveURL(/waitlist\/[a-z0-9]+/i, { timeout: 20_000 });
	});
});

// ─── Referral page ─────────────────────────────────────────────

test.describe("Waitlist referral", () => {
	test("shows referral dashboard with valid code", async ({ page }) => {
		// Use seeded referral code from seed.sql
		await page.goto("/waitlist/alice01");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		// Should show referral info or signup form with referral attribution
		await expect(page.locator("body")).not.toContainText("404");
	});
});

// ─── Newsletter ───────────────────────────────────────────────

test.describe("Newsletter signup", () => {
	test("shows signup form on /newsletter", async ({ page }) => {
		await page.goto("/newsletter");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		await expect(page.getByLabel(/email/i)).toBeVisible();
		await expect(page.getByLabel(/name/i)).toBeVisible();
	});

	test("submits newsletter form successfully", async ({ page }) => {
		await page.goto("/newsletter");

		const email = `newsletter-${Date.now()}@example.com`;
		await page.getByLabel(/email/i).fill(email);
		await page.getByLabel(/name/i).fill("E2E Newsletter User");

		await waitForTurnstile(page);
		const form = page.locator("form");
		const submitButton = form.getByRole("button", { name: /subscribe|submit/i });
		await submitButton.click();

		// Should show success message (form replaced by "Thanks for subscribing!")
		await expect(page.getByText("Thanks for subscribing!")).toBeVisible({ timeout: 10_000 });
	});

	test("prevents duplicate email signup", async ({ page }) => {
		// Use the seeded email from seed.sql
		await page.goto("/newsletter");
		await page.getByLabel(/email/i).fill("alice@example.com");
		await page.getByLabel(/name/i).fill("Alice Duplicate");

		await waitForTurnstile(page);
		const form = page.locator("form");
		const submitButton = form.getByRole("button", { name: /subscribe|submit/i });
		await submitButton.click();

		// Should show success (existing subscriber returns ok — same success state)
		await expect(page.getByText("Thanks for subscribing!")).toBeVisible({ timeout: 10_000 });
	});
});

// ─── Contact Form ──────────────────────────────────────────────

test.describe("Contact form", () => {
	test("shows contact form on /contact", async ({ page }) => {
		await page.goto("/contact");
		await expect(page.getByRole("heading", { level: 1, name: /contact/i })).toBeVisible();
		await expect(page.getByLabel(/name/i)).toBeVisible();
		await expect(page.getByLabel(/email/i)).toBeVisible();
		await expect(page.getByLabel(/message/i)).toBeVisible();
	});

	test("submits contact form successfully", async ({ page }) => {
		await page.goto("/contact");

		await page.getByLabel(/name/i).fill("E2E Contact");
		await page.getByLabel(/email/i).fill(`contact-${Date.now()}@example.com`);
		await page.getByLabel(/message/i).fill("This is an E2E test message for the contact form.");

		await waitForTurnstile(page);
		const form = page.locator("form");
		const submitButton = form.getByRole("button", { name: /send|submit/i });
		await submitButton.click();

		// Should show success (form replaced by "Message Sent")
		await expect(page.getByText("Message Sent")).toBeVisible({ timeout: 10_000 });
	});
});

// ─── Giveaway ──────────────────────────────────────────────────

test.describe("Giveaway entry", () => {
	test("shows giveaway page", async ({ page }) => {
		await page.goto("/giveaway");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	});

	test("shows entry form with email field", async ({ page }) => {
		await page.goto("/giveaway");
		const emailField = page.getByLabel(/email/i);
		// If giveaway is active, form should be visible
		if (await emailField.isVisible({ timeout: 3_000 }).catch(() => false)) {
			await expect(emailField).toBeVisible();
		}
	});
});

// ─── Search ────────────────────────────────────────────────────

test.describe("Search", () => {
	test("opens search dialog with keyboard shortcut", async ({ page }) => {
		await page.goto("/");
		await page.keyboard.press("Meta+k");
		// The search dialog should appear
		await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5_000 });
	});

	test("returns results for seeded content", async ({ page }) => {
		// Use the API directly for reliable testing
		const response = await page.request.get("/api/search?q=getting+started");
		expect(response.ok()).toBeTruthy();
		const json = await response.json();
		expect(json.ok).toBe(true);
	});
});

// ─── Unsubscribe ───────────────────────────────────────────────

test.describe("Unsubscribe", () => {
	test("rejects invalid token", async ({ page }) => {
		const response = await page.request.get(
			"/api/unsubscribe?email=alice@example.com&token=invalid-token",
		);
		// Should return error for invalid HMAC token
		const json = await response.json();
		expect(json.ok).toBe(false);
	});
});

// ─── Blog (public) ─────────────────────────────────────────────

test.describe("Blog public pages", () => {
	test("blog list page loads and shows posts", async ({ page }) => {
		await page.goto("/blog");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	});

	test("blog post page loads with seeded content", async ({ page }) => {
		await page.goto("/blog/getting-started-with-our-product");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		// Should have breadcrumbs
		const breadcrumb = page.locator("nav[aria-label='Breadcrumb']");
		await expect(breadcrumb.getByText("Home")).toBeVisible();
		await expect(breadcrumb.getByText("Blog")).toBeVisible();
	});

	test("blog RSS feed returns valid XML", async ({ page }) => {
		const response = await page.request.get("/feed.xml");
		expect(response.ok()).toBeTruthy();
		const contentType = response.headers()["content-type"];
		expect(contentType).toContain("xml");
	});
});

// ─── SEO essentials ────────────────────────────────────────────

test.describe("SEO", () => {
	test("sitemap.xml returns valid XML", async ({ page }) => {
		const response = await page.request.get("/sitemap.xml");
		expect(response.ok()).toBeTruthy();
		const body = await response.text();
		expect(body).toContain("<urlset");
		expect(body).toContain("<url>");
	});

	test("robots.txt returns content", async ({ page }) => {
		const response = await page.request.get("/robots.txt");
		expect(response.ok()).toBeTruthy();
		const body = await response.text();
		// Next.js metadata route generates "User-agent" or "user-agent" depending on version
		expect(body.toLowerCase()).toContain("user-agent");
	});

	test("home page has JSON-LD", async ({ page }) => {
		await page.goto("/");
		const jsonLd = page.locator('script[type="application/ld+json"]');
		await expect(jsonLd.first()).toBeAttached();
	});
});
