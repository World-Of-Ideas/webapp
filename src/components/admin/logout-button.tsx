"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
	const router = useRouter();

	async function handleLogout() {
		await fetch("/api/admin/logout", { method: "POST" });
		router.push("/admin");
		router.refresh();
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={handleLogout}
			className="w-full justify-start text-muted-foreground hover:text-foreground"
		>
			Log Out
		</Button>
	);
}
