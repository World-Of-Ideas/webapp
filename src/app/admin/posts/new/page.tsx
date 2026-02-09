import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/post-editor/post-editor";

export const metadata: Metadata = {
	title: "New Post | Admin",
};

export default function NewPostPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">New Post</h1>
			<PostEditor />
		</div>
	);
}
