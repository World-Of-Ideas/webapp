import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { redirects } from "@/db/schema";
import { RedirectEditor } from "@/components/admin/redirect-editor";

export const metadata: Metadata = {
	title: "Edit Redirect | Admin",
};

export default async function EditRedirectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const redirectId = parseInt(id, 10);

	if (isNaN(redirectId)) {
		notFound();
	}

	const db = await getDb();
	const redirect = await db.query.redirects.findFirst({
		where: eq(redirects.id, redirectId),
	});

	if (!redirect) {
		notFound();
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Edit Redirect</h1>
			<RedirectEditor redirect={redirect} />
		</div>
	);
}
