import type { Metadata } from "next";
import { RedirectEditor } from "@/components/admin/redirect-editor";

export const metadata: Metadata = {
	title: "New Redirect | Admin",
};

export default function NewRedirectPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">New Redirect</h1>
			<RedirectEditor />
		</div>
	);
}
