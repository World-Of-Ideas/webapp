import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getSubscriberCount } from "@/lib/waitlist";
import { getPostCount } from "@/lib/blog";
import { getContactCount } from "@/lib/contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
	title: "Dashboard | Admin",
};

function StatsCard({
	title,
	value,
}: {
	title: string;
	value: number;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-sm font-medium text-muted-foreground">
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-3xl font-bold">{value}</p>
			</CardContent>
		</Card>
	);
}

export default async function DashboardPage() {
	const [postCount, contactCount, subscriberCount] = await Promise.all([
		getPostCount(),
		getContactCount(),
		siteConfig.features.waitlist ? getSubscriberCount() : Promise.resolve(0),
	]);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Dashboard</h1>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{siteConfig.features.waitlist && (
					<StatsCard title="Subscribers" value={subscriberCount} />
				)}
				<StatsCard title="Published Posts" value={postCount} />
				<StatsCard
					title="Contact Submissions"
					value={contactCount}
				/>
			</div>
		</div>
	);
}
