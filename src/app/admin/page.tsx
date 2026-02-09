import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { LoginForm } from "@/components/admin/login-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
	title: `Admin Login | ${siteConfig.name}`,
};

export default function AdminLoginPage() {
	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Admin Login</CardTitle>
					<CardDescription>
						Enter your password to access the admin panel.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<LoginForm />
				</CardContent>
			</Card>
		</div>
	);
}
