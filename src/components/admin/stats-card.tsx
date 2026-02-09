import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface StatsCardProps {
	title: string;
	value: string | number;
	description?: string;
}

export function StatsCard({ title, value, description }: StatsCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardDescription>{title}</CardDescription>
				<CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
			</CardHeader>
			{description && (
				<CardContent>
					<p className="text-xs text-muted-foreground">{description}</p>
				</CardContent>
			)}
		</Card>
	);
}
