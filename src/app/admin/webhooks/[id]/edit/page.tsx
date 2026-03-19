import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWebhookById } from "@/lib/webhooks";
import { WebhookEditor } from "@/components/admin/webhook-editor";

export const metadata: Metadata = {
	title: "Edit Webhook | Admin",
};

export default async function EditWebhookPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const webhookId = parseInt(id, 10);

	if (isNaN(webhookId)) {
		notFound();
	}

	const webhook = await getWebhookById(webhookId);

	if (!webhook) {
		notFound();
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Edit Webhook</h1>
			<WebhookEditor
				webhook={{
					id: webhook.id,
					url: webhook.url,
					events: webhook.events as string[],
					secret: webhook.secret,
					active: webhook.active,
				}}
			/>
		</div>
	);
}
