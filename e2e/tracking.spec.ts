import { test, expect } from "@playwright/test";

// Helper: update tracking settings via API
async function updateTracking(
	request: import("@playwright/test").APIRequestContext,
	data: Record<string, unknown>,
) {
	const res = await request.put("/api/admin/tracking", { data });
	expect(res.ok()).toBeTruthy();
}

// Helper: get tracking settings via API
async function getTracking(request: import("@playwright/test").APIRequestContext) {
	const res = await request.get("/api/admin/tracking");
	expect(res.ok()).toBeTruthy();
	const body = (await res.json()) as { data: Record<string, unknown> };
	return body.data;
}

// ─── Admin tracking settings page ────────────────────────
test.describe("Admin tracking settings", () => {
	test("page loads with all tracking cards", async ({ page }) => {
		await page.goto("/admin/tracking");
		await page.waitForLoadState("domcontentloaded");

		await expect(page.getByRole("heading", { name: "Tracking" })).toBeVisible();
		await expect(page.getByText("Facebook Pixel", { exact: true })).toBeVisible();
		await expect(page.getByText("Conversion API (CAPI)", { exact: true })).toBeVisible();
		await expect(page.getByText("Google Analytics", { exact: true })).toBeVisible();
		await expect(page.getByText("Measurement Protocol", { exact: true })).toBeVisible();
		await expect(page.getByText("Google Tag Manager", { exact: true })).toBeVisible();
		await expect(page.getByText("UTM Tracking", { exact: true })).toBeVisible();
		await expect(page.getByText("Cookie Consent", { exact: true })).toBeVisible();
	});

	test("accessible via sidebar", async ({ page }) => {
		await page.goto("/admin/dashboard");
		await page.waitForLoadState("domcontentloaded");

		await page.locator("aside").getByText("Tracking", { exact: true }).click();
		await expect(page).toHaveURL(/\/admin\/tracking/);
		await expect(page.getByRole("heading", { name: "Tracking" })).toBeVisible();
	});

	test("shows seeded values in form fields", async ({ page }) => {
		await page.goto("/admin/tracking");
		await page.waitForLoadState("domcontentloaded");

		// Pixel ID should be populated from seed
		await expect(page.getByLabel("Pixel ID")).toHaveValue("1234567890123456");
		// GA Measurement ID
		await expect(page.getByLabel("Measurement ID")).toHaveValue("G-TESTDEV001");
		// GTM Container ID
		await expect(page.getByLabel("Container ID")).toHaveValue("GTM-TEST001");
	});

	test("can save GTM settings", async ({ page }) => {
		await page.goto("/admin/tracking");
		await page.waitForLoadState("domcontentloaded");

		// Change GTM container ID
		await page.getByLabel("Container ID").fill("GTM-NEWTEST1");
		await page.getByRole("button", { name: "Save Settings" }).click();

		await expect(page.getByText("Settings saved successfully")).toBeVisible();

		// Reload and verify persisted
		await page.reload();
		await page.waitForLoadState("domcontentloaded");
		await expect(page.getByLabel("Container ID")).toHaveValue("GTM-NEWTEST1");

		// Restore original
		await page.getByLabel("Container ID").fill("GTM-TEST001");
		await page.getByRole("button", { name: "Save Settings" }).click();
		await expect(page.getByText("Settings saved successfully")).toBeVisible();
	});

	test("rejects invalid GTM container ID", async ({ request }) => {
		const res = await request.put("/api/admin/tracking", {
			data: { gtmContainerId: "INVALID" },
		});
		expect(res.ok()).toBeFalsy();
		const body = (await res.json()) as { error: { message: string } };
		expect(body.error.message).toContain("Container ID must start with GTM-");
	});

	test("rejects invalid GA measurement ID", async ({ request }) => {
		const res = await request.put("/api/admin/tracking", {
			data: { gaMeasurementId: "UA-12345" },
		});
		expect(res.ok()).toBeFalsy();
		const body = (await res.json()) as { error: { message: string } };
		expect(body.error.message).toContain("Measurement ID must start with G-");
	});

	test("rejects invalid pixel ID", async ({ request }) => {
		const res = await request.put("/api/admin/tracking", {
			data: { metaPixelId: "not-digits" },
		});
		expect(res.ok()).toBeFalsy();
		const body = (await res.json()) as { error: { message: string } };
		expect(body.error.message).toContain("Pixel ID must contain only digits");
	});
});

// ─── Tracking API CRUD ──────────────────────────────────
test.describe("Tracking API", () => {
	test("GET returns all tracking fields", async ({ request }) => {
		const data = await getTracking(request);
		expect(data).toMatchObject({
			metaPixelEnabled: true,
			metaPixelId: "1234567890123456",
			metaCapiEnabled: true,
			hasCapiToken: true,
			gaEnabled: true,
			gaMeasurementId: "G-TESTDEV001",
			gaMpEnabled: true,
			hasGaMpApiSecret: true,
			gtmEnabled: true,
			gtmContainerId: "GTM-TEST001",
			utmTrackingEnabled: true,
			cookieConsentEnabled: false,
		});
	});

	test("PUT toggles GTM on/off", async ({ request }) => {
		// Disable GTM
		await updateTracking(request, { gtmEnabled: false });
		let data = await getTracking(request);
		expect(data.gtmEnabled).toBe(false);

		// Re-enable GTM
		await updateTracking(request, { gtmEnabled: true });
		data = await getTracking(request);
		expect(data.gtmEnabled).toBe(true);
	});

	test("PUT clears container ID with empty string", async ({ request }) => {
		await updateTracking(request, { gtmContainerId: "" });
		let data = await getTracking(request);
		expect(data.gtmContainerId).toBe("");

		// Restore
		await updateTracking(request, { gtmContainerId: "GTM-TEST001" });
		data = await getTracking(request);
		expect(data.gtmContainerId).toBe("GTM-TEST001");
	});
});

// ─── Script rendering on public pages ───────────────────
test.describe("Public page script rendering", () => {
	// Seed has all tracking enabled, cookie consent OFF → scripts should render freely

	test("GA script tag is present", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		const gaScript = page.locator('script[src*="googletagmanager.com/gtag/js?id=G-TESTDEV001"]');
		await expect(gaScript).toHaveCount(1);
	});

	test("GTM script tag is present", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		// GTM inline script containing the container ID
		const gtmScript = page.locator('script#gtm-script');
		await expect(gtmScript).toHaveCount(1);
		const content = await gtmScript.textContent();
		expect(content).toContain("GTM-TEST001");
	});

	test("GTM noscript iframe is present in page source", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		// Playwright can't query inside <noscript> with JS enabled, check raw HTML
		const html = await page.content();
		expect(html).toContain("googletagmanager.com/ns.html?id=GTM-TEST001");
	});

	test("Meta Pixel script is present", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		const pixelScript = page.locator('script#fb-pixel');
		await expect(pixelScript).toHaveCount(1);
		const content = await pixelScript.textContent();
		expect(content).toContain("1234567890123456");
	});

	test("Meta Pixel noscript img is present in page source", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		// Playwright can't query inside <noscript> with JS enabled, check raw HTML
		const html = await page.content();
		expect(html).toContain("facebook.com/tr?id=1234567890123456");
	});

	test("no consent mode script when consent disabled", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		// Consent mode defaults script should NOT be present when cookie consent is off
		const html = await page.content();
		expect(html).not.toContain("analytics_storage");
	});

	test("no cookie consent banner when consent disabled", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		await expect(page.getByText("We use cookies")).toHaveCount(0);
	});

	test("scripts disappear when tracking disabled", async ({ request, page }) => {
		// Disable all tracking
		await updateTracking(request, {
			gaEnabled: false,
			gtmEnabled: false,
			metaPixelEnabled: false,
		});

		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		await expect(page.locator('script#gtm-script')).toHaveCount(0);
		await expect(page.locator('script#ga-config')).toHaveCount(0);
		await expect(page.locator('script#fb-pixel')).toHaveCount(0);

		// Restore
		await updateTracking(request, {
			gaEnabled: true,
			gtmEnabled: true,
			metaPixelEnabled: true,
		});
	});
});

// ─── Cookie consent integration ─────────────────────────
test.describe("Cookie consent with tracking", () => {
	test.beforeEach(async ({ request, context }) => {
		// Enable cookie consent
		await updateTracking(request, { cookieConsentEnabled: true });
		// Clear consent cookie so banner appears
		await context.clearCookies();
	});

	test.afterEach(async ({ request }) => {
		// Restore: disable consent so other tests are unaffected
		await updateTracking(request, { cookieConsentEnabled: false });
	});

	test("scripts are blocked before consent", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		// No tracking scripts should be in the DOM
		await expect(page.locator('script#gtm-script')).toHaveCount(0);
		await expect(page.locator('script#ga-config')).toHaveCount(0);
		await expect(page.locator('script#fb-pixel')).toHaveCount(0);
	});

	test("consent banner appears with analytics and marketing categories", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		await expect(page.getByText("We use cookies")).toBeVisible();

		// Expand to see categories
		await page.getByRole("button", { name: "Customize" }).click();
		await expect(page.getByText("Necessary", { exact: true })).toBeVisible();
		await expect(page.getByText("Analytics", { exact: true })).toBeVisible();
		await expect(page.getByText("Marketing", { exact: true })).toBeVisible();
	});

	test("accept all loads all scripts", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		await page.getByRole("button", { name: "Accept All" }).click();

		// After consent + router.refresh(), scripts should appear
		await expect(page.locator('script#gtm-script')).toHaveCount(1, { timeout: 10_000 });
		await expect(page.locator('script#ga-config')).toHaveCount(1);
		await expect(page.locator('script#fb-pixel')).toHaveCount(1);
	});

	test("accept all sets consent mode to granted", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		await page.getByRole("button", { name: "Accept All" }).click();

		// Wait for router.refresh() to load scripts
		await expect(page.locator('script#gtm-script')).toHaveCount(1, { timeout: 10_000 });

		// Consent mode script is inlined by Next.js (beforeInteractive), check raw HTML
		const html = await page.content();
		expect(html).toContain("'analytics_storage':'granted'");
		expect(html).toContain("'ad_storage':'granted'");
		expect(html).toContain("'ad_user_data':'granted'");
		expect(html).toContain("'ad_personalization':'granted'");
	});

	test("reject all keeps scripts blocked", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		await page.getByRole("button", { name: "Reject All" }).click();

		// Brief wait for router.refresh()
		await page.waitForTimeout(1000);

		// Scripts should still be absent
		await expect(page.locator('script#gtm-script')).toHaveCount(0);
		await expect(page.locator('script#ga-config')).toHaveCount(0);
		await expect(page.locator('script#fb-pixel')).toHaveCount(0);
	});

	test("accept only analytics loads GA + GTM but not Meta Pixel", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		// Expand preferences
		await page.getByRole("button", { name: "Customize" }).click();

		// Toggle analytics on (it starts off since no prior consent)
		await page.locator('#consent-analytics').click();
		// Ensure marketing stays off
		const marketingToggle = page.locator('#consent-marketing');
		// It should already be unchecked but verify
		await expect(marketingToggle).not.toBeChecked();

		await page.getByRole("button", { name: "Save Preferences" }).click();

		// GA and GTM should load (analytics category)
		await expect(page.locator('script#ga-config')).toHaveCount(1, { timeout: 10_000 });
		await expect(page.locator('script#gtm-script')).toHaveCount(1);

		// Meta Pixel should NOT load (marketing category)
		await expect(page.locator('script#fb-pixel')).toHaveCount(0);
	});

	test("analytics-only consent sets ad_storage to denied in consent mode", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		await page.getByRole("button", { name: "Customize" }).click();
		await page.locator('#consent-analytics').click();
		await page.getByRole("button", { name: "Save Preferences" }).click();

		// Wait for router.refresh() to load scripts
		await expect(page.locator('script#gtm-script')).toHaveCount(1, { timeout: 10_000 });

		// Consent mode script is inlined by Next.js (beforeInteractive), check raw HTML
		const html = await page.content();
		expect(html).toContain("'analytics_storage':'granted'");
		expect(html).toContain("'ad_storage':'denied'");
		expect(html).toContain("'ad_user_data':'denied'");
		expect(html).toContain("'ad_personalization':'denied'");
	});

	test("cookie preferences button in footer re-opens banner", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");

		// Accept all first to dismiss banner
		await page.getByRole("button", { name: "Accept All" }).click();

		// Banner should be gone
		await expect(page.getByText("We use cookies")).toHaveCount(0);

		// Click Cookie Preferences in footer
		await page.locator("footer").getByRole("button", { name: "Cookie Preferences" }).click();

		// Banner re-appears in expanded mode
		await expect(page.getByRole("heading", { name: "Cookie Preferences" })).toBeVisible();
		await expect(page.getByText("Necessary", { exact: true })).toBeVisible();
	});
});

// ─── Unauthenticated tracking API access ────────────────
test.describe("Unauthenticated tracking API", () => {
	test.use({ storageState: { cookies: [], origins: [] } });

	test("GET tracking returns 401 without auth", async ({ request }) => {
		const res = await request.get("/api/admin/tracking");
		expect(res.status()).toBe(401);
	});

	test("PUT tracking returns 401 without auth", async ({ request }) => {
		const res = await request.put("/api/admin/tracking", {
			data: { gtmEnabled: true },
		});
		expect(res.status()).toBe(401);
	});
});
