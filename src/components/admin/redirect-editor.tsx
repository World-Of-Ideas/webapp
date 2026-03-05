"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface RedirectData {
	id: number;
	fromPath: string;
	toUrl: string;
	statusCode: number;
	enabled: boolean;
}

interface RedirectEditorProps {
	redirect?: RedirectData;
}

export function RedirectEditor({ redirect }: RedirectEditorProps) {
	const router = useRouter();
	const isEditMode = !!redirect;

	const [fromPath, setFromPath] = useState(redirect?.fromPath ?? "/");
	const [toUrl, setToUrl] = useState(redirect?.toUrl ?? "");
	const [statusCode, setStatusCode] = useState(redirect?.statusCode ?? 301);
	const [enabled, setEnabled] = useState(redirect?.enabled ?? true);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState("");

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");
		setIsSaving(true);

		const body = {
			fromPath,
			toUrl,
			statusCode,
			enabled,
		};

		try {
			const url = isEditMode
				? `/api/admin/redirects/${redirect.id}`
				: "/api/admin/redirects";
			const method = isEditMode ? "PUT" : "POST";

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const data = (await res.json()) as { error?: { code: string; message: string } };

			if (!res.ok) {
				setError(data.error?.message ?? "Failed to save redirect.");
				return;
			}

			router.push("/admin/redirects");
		} catch {
			setError("Failed to save redirect. Please try again.");
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete() {
		if (!redirect || !confirm("Are you sure you want to delete this redirect?")) return;
		setIsDeleting(true);

		try {
			const res = await fetch(`/api/admin/redirects/${redirect.id}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				const data = (await res.json()) as { error?: { message: string } };
				setError(data.error?.message ?? "Failed to delete redirect.");
				return;
			}

			router.push("/admin/redirects");
		} catch {
			setError("Failed to delete redirect. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="redirect-from">From Path</Label>
				<Input
					id="redirect-from"
					value={fromPath}
					onChange={(e) => setFromPath(e.target.value)}
					placeholder="/old-page"
					required
					disabled={isSaving}
				/>
				<p className="text-xs text-muted-foreground">
					Must start with /. Cannot redirect /admin or /api paths.
				</p>
			</div>

			<div className="space-y-2">
				<Label htmlFor="redirect-to">To URL</Label>
				<Input
					id="redirect-to"
					value={toUrl}
					onChange={(e) => setToUrl(e.target.value)}
					placeholder="https://example.com/new-page or /new-path"
					required
					disabled={isSaving}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="redirect-status">Status Code</Label>
				<select
					id="redirect-status"
					value={statusCode}
					onChange={(e) => setStatusCode(Number(e.target.value))}
					disabled={isSaving}
					className="w-full rounded-md border bg-background px-3 py-2 text-sm"
				>
					<option value={301}>301 (Permanent)</option>
					<option value={302}>302 (Temporary)</option>
				</select>
			</div>

			<div className="flex items-center gap-3">
				<Switch
					id="redirect-enabled"
					checked={enabled}
					onCheckedChange={setEnabled}
					disabled={isSaving}
				/>
				<Label htmlFor="redirect-enabled">Enabled</Label>
			</div>

			{error && (
				<p className="text-sm text-destructive" role="alert">{error}</p>
			)}

			<div className="flex gap-3">
				<Button type="submit" disabled={isSaving || isDeleting}>
					{isSaving ? "Saving..." : isEditMode ? "Update Redirect" : "Create Redirect"}
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
