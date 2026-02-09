import type { Metadata } from "next";
import { getSeoAudit } from "@/lib/seo";
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
	title: "SEO Audit | Admin",
};

function LengthBadge({
	value,
	min,
	max,
}: {
	value: number;
	min: number;
	max: number;
}) {
	const isGood = value >= min && value <= max;
	return (
		<span className={isGood ? "text-green-600" : "text-yellow-600"}>
			{value}
		</span>
	);
}

export default async function SeoAuditPage() {
	const items = await getSeoAudit();

	const fullyOptimized = items.filter(
		(item) =>
			item.titleLength >= 30 &&
			item.titleLength <= 60 &&
			item.descriptionLength >= 120 &&
			item.descriptionLength <= 160 &&
			item.faqCount > 0 &&
			item.hasCoverImage,
	).length;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">SEO Audit</h1>
				<p className="text-sm text-muted-foreground">
					{fullyOptimized}/{items.length} pages fully optimized
				</p>
			</div>

			{items.length === 0 ? (
				<p className="text-muted-foreground">
					No published content to audit. Publish pages or posts to see
					SEO data.
				</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Type</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Title Length</TableHead>
							<TableHead>Desc Length</TableHead>
							<TableHead>FAQs</TableHead>
							<TableHead>Cover Image</TableHead>
							<TableHead>Tags</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((item) => (
							<TableRow key={`${item.type}-${item.slug}`}>
								<TableCell>
									<Badge
										variant={
											item.type === "post"
												? "default"
												: "secondary"
										}
									>
										{item.type}
									</Badge>
								</TableCell>
								<TableCell className="font-mono text-xs">
									/{item.slug}
								</TableCell>
								<TableCell>
									<LengthBadge
										value={item.titleLength}
										min={30}
										max={60}
									/>
								</TableCell>
								<TableCell>
									<LengthBadge
										value={item.descriptionLength}
										min={120}
										max={160}
									/>
								</TableCell>
								<TableCell>
									<span
										className={
											item.faqCount > 0
												? "text-green-600"
												: "text-red-600"
										}
									>
										{item.faqCount}
									</span>
								</TableCell>
								<TableCell>
									{item.hasCoverImage ? (
										<span className="text-green-600">
											Yes
										</span>
									) : (
										<span className="text-red-600">
											No
										</span>
									)}
								</TableCell>
								<TableCell>
									{item.type === "post" ? (
										<span
											className={
												item.tagCount > 0
													? "text-muted-foreground"
													: "text-yellow-600"
											}
										>
											{item.tagCount}
										</span>
									) : (
										<span className="text-muted-foreground">
											-
										</span>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
