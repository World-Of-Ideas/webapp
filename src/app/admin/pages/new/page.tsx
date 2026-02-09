import type { Metadata } from "next";
import { PageEditor } from "@/components/admin/page-editor/page-editor";

export const metadata: Metadata = {
	title: "New Page | Admin",
};

export default function NewPagePage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">New Page</h1>
			<PageEditor />
		</div>
	);
}
