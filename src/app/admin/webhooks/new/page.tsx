import type { Metadata } from "next";
import { WebhookEditor } from "@/components/admin/webhook-editor";

export const metadata: Metadata = {
	title: "New Webhook | Admin",
};

export default function NewWebhookPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">New Webhook</h1>
			<WebhookEditor />
		</div>
	);
}
