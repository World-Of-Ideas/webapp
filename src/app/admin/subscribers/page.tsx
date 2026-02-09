import type { Metadata } from "next";
import { getSubscribers } from "@/lib/waitlist";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
	title: "Subscribers | Admin",
};

export default async function SubscribersPage() {
	const { items: subscribers, total } = await getSubscribers(1, 50);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Subscribers</h1>
				<p className="text-sm text-muted-foreground">
					{total} total subscriber{total !== 1 ? "s" : ""}
				</p>
			</div>

			{subscribers.length === 0 ? (
				<p className="text-muted-foreground">No subscribers yet.</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Referral Code</TableHead>
							<TableHead>Referrals</TableHead>
							<TableHead>Position</TableHead>
							<TableHead>Source</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Date</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{subscribers.map((subscriber) => (
							<TableRow key={subscriber.id}>
								<TableCell className="font-medium">
									{subscriber.name}
								</TableCell>
								<TableCell>{subscriber.email}</TableCell>
								<TableCell className="font-mono text-xs">
									{subscriber.referralCode}
								</TableCell>
								<TableCell>
									{subscriber.referralCount}
								</TableCell>
								<TableCell>#{subscriber.position}</TableCell>
								<TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
									{subscriber.source ?? "—"}
								</TableCell>
								<TableCell>
									<Badge
										variant={
											subscriber.status === "active"
												? "default"
												: subscriber.status ===
													  "unsubscribed"
													? "destructive"
													: "secondary"
										}
									>
										{subscriber.status}
									</Badge>
								</TableCell>
								<TableCell className="text-muted-foreground">
									{new Date(
										subscriber.createdAt,
									).toLocaleDateString()}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
