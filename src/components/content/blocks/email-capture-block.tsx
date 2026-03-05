"use client";

import { useState } from "react";
import type { ContentBlock } from "@/types/content";
import { Turnstile } from "@/components/shared/turnstile";

interface EmailCaptureBlockProps {
	block: ContentBlock;
}

export function EmailCaptureBlock({ block }: EmailCaptureBlockProps) {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");
	const [turnstileToken, setTurnstileToken] = useState("");

	if (!block) return null;

	const heading = block.emailCaptureHeading || "Stay updated";
	const placeholder = block.emailCapturePlaceholder || "Enter your email";
	const buttonText = block.emailCaptureButtonText || "Subscribe";

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/api/waitlist", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, name: "", turnstileToken }),
			});

			if (!res.ok) {
				const data = (await res.json()) as { error?: string };
				throw new Error(data.error ?? "Something went wrong");
			}

			setSuccess(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	if (success) {
		return (
			<div className="my-6 rounded-lg border bg-muted/30 p-6 text-center sm:p-8">
				<p className="text-base font-medium text-foreground sm:text-lg">
					You&apos;re on the list!
				</p>
			</div>
		);
	}

	return (
		<div className="my-6 rounded-lg border bg-muted/30 p-6 text-center sm:p-8">
			<h3 className="mb-4 text-lg font-semibold text-foreground sm:text-xl">
				{heading}
			</h3>
			<form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col items-center gap-3 sm:flex-row">
				<input
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder={placeholder}
					className="w-full rounded-md border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:flex-1"
					aria-label="Email address"
				/>
				<button
					type="submit"
					disabled={loading || !turnstileToken}
					className="w-full rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
				>
					{loading ? "Submitting..." : buttonText}
				</button>
			</form>
			{error && (
				<p className="mt-3 text-sm text-destructive">{error}</p>
			)}
			<Turnstile onSuccess={(token) => setTurnstileToken(token)} />
		</div>
	);
}
