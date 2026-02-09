import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug, isSystemPage } from "@/lib/pages";
import { PageEditor } from "@/components/admin/page-editor/page-editor";

export const metadata: Metadata = {
	title: "Edit Page | Admin",
};

export default async function EditPagePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	const page = await getPageBySlug(slug);

	if (!page) {
		notFound();
	}

	const isSystem = isSystemPage(slug);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">
				Edit {isSystem ? "System " : ""}Page
			</h1>
			<PageEditor page={page} isSystem={isSystem} />
		</div>
	);
}
