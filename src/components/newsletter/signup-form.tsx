"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Turnstile } from "@/components/shared/turnstile";
import { getUtmParams } from "@/lib/utm";

export function NewsletterForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [turnstileToken, setTurnstileToken] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");

		if (!turnstileToken) {
			setError("Please complete the verification.");
			return;
		}

		setIsSubmitting(true);

		try {
			const utm = getUtmParams();
			const source = utm ? `newsletter-form|${utm}` : "newsletter-form";

			const res = await fetch("/api/newsletter", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, name, turnstileToken, source }),
			});

			const data = (await res.json()) as { error?: { code: string; message: string }; data?: { eventId?: string; existing?: boolean } };

			if (!res.ok) {
				setError(data.error?.message ?? "Something went wrong. Please try again.");
				return;
			}

			if (data.data?.eventId) {
				window.fbq?.("track", "Lead", {}, { eventID: data.data.eventId });
				window.gtag?.("event", "generate_lead", { event_category: "form", event_label: "newsletter" });
			}

			setSuccess(true);
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	}

	if (success) {
		return (
			<div className="rounded-lg border bg-muted/50 p-6 text-center">
				<p className="text-lg font-medium">Thanks for subscribing!</p>
				<p className="mt-2 text-sm text-muted-foreground">
					You&apos;ll receive our latest updates in your inbox.
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					type="text"
					placeholder="Your name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					disabled={isSubmitting}
					className="rounded-full"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					placeholder="you@example.com"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					disabled={isSubmitting}
					className="rounded-full"
				/>
			</div>

			<Turnstile onSuccess={setTurnstileToken} />

			{error && (
				<p className="text-sm text-destructive" role="alert">{error}</p>
			)}

			<button
				type="submit"
				className="w-full rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
				disabled={isSubmitting}
			>
				{isSubmitting ? "Subscribing..." : "Subscribe"}
			</button>
		</form>
	);
}
