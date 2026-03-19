"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const AVAILABLE_EVENTS = [
	{ value: "waitlist.signup", label: "Waitlist Signup" },
	{ value: "giveaway.entry", label: "Giveaway Entry" },
	{ value: "contact.submission", label: "Contact Submission" },
];

interface WebhookData {
	id: number;
	url: string;
	events: string[];
	secret: string;
	active: boolean;
}

interface WebhookEditorProps {
	webhook?: WebhookData;
}

export function WebhookEditor({ webhook }: WebhookEditorProps) {
	const router = useRouter();
	const isEditMode = !!webhook;

	const [url, setUrl] = useState(webhook?.url ?? "");
	const [events, setEvents] = useState<string[]>(webhook?.events ?? []);
	const [active, setActive] = useState(webhook?.active ?? true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState("");

	function toggleEvent(event: string) {
		setEvents((prev) =>
			prev.includes(event)
				? prev.filter((e) => e !== event)
				: [...prev, event],
		);
	}

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");

		if (events.length === 0) {
			setError("Select at least one event.");
			return;
		}

		setIsSaving(true);

		const body = isEditMode
			? { url, events, active }
			: { url, events };

		try {
			const apiUrl = isEditMode
				? `/api/admin/webhooks/${webhook.id}`
				: "/api/admin/webhooks";
			const method = isEditMode ? "PUT" : "POST";

			const res = await fetch(apiUrl, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const data = (await res.json()) as { error?: { code: string; message: string } };

			if (!res.ok) {
				setError(data.error?.message ?? "Failed to save webhook.");
				return;
			}

			router.push("/admin/webhooks");
		} catch {
			setError("Failed to save webhook. Please try again.");
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete() {
		if (!webhook || !confirm("Are you sure you want to delete this webhook?")) return;
		setIsDeleting(true);

		try {
			const res = await fetch(`/api/admin/webhooks/${webhook.id}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				const data = (await res.json()) as { error?: { message: string } };
				setError(data.error?.message ?? "Failed to delete webhook.");
				return;
			}

			router.push("/admin/webhooks");
		} catch {
			setError("Failed to delete webhook. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="webhook-url">Endpoint URL</Label>
				<Input
					id="webhook-url"
					type="url"
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					placeholder="https://example.com/webhook"
					required
					disabled={isSaving}
				/>
				<p className="text-xs text-muted-foreground">
					Must be an HTTPS URL. Payloads are signed with HMAC-SHA256.
				</p>
			</div>

			<fieldset className="space-y-3">
				<legend className="text-sm font-medium">Events</legend>
				{AVAILABLE_EVENTS.map((evt) => (
					<label key={evt.value} className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={events.includes(evt.value)}
							onChange={() => toggleEvent(evt.value)}
							disabled={isSaving}
							className="rounded border-border"
						/>
						{evt.label}
					</label>
				))}
			</fieldset>

			{isEditMode && (
				<div className="flex items-center gap-3">
					<Switch
						id="webhook-active"
						checked={active}
						onCheckedChange={setActive}
						disabled={isSaving}
					/>
					<Label htmlFor="webhook-active">Active</Label>
				</div>
			)}

			{isEditMode && webhook.secret && (
				<div className="space-y-2">
					<Label>Signing Secret</Label>
					<code className="block rounded bg-muted px-3 py-2 text-xs font-mono break-all">
						{webhook.secret}
					</code>
					<p className="text-xs text-muted-foreground">
						Use this to verify webhook signatures via the X-Webhook-Signature header.
					</p>
				</div>
			)}

			{error && (
				<p className="text-sm text-destructive" role="alert">{error}</p>
			)}

			<div className="flex gap-3">
				<Button type="submit" disabled={isSaving || isDeleting}>
					{isSaving ? "Saving..." : isEditMode ? "Update Webhook" : "Create Webhook"}
				</Button>
				{isEditMode && (
					<Button
						type="button"
						variant="destructive"
						onClick={handleDelete}
						disabled={isSaving || isDeleting}
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				)}
			</div>
		</form>
	);
}
