import type { ContentBlock } from "@/types/content";
import { isSafeUrl } from "@/lib/utils";

interface TestimonialBlockProps {
	block: ContentBlock;
}

export function TestimonialBlock({ block }: TestimonialBlockProps) {
	if (!block.text) return null;

	return (
		<figure className="rounded-lg border bg-card p-6">
			<blockquote className="text-base italic text-foreground sm:text-lg">
				&ldquo;{block.text}&rdquo;
			</blockquote>
			{(block.author || block.company) && (
				<figcaption className="mt-4 flex items-center gap-3">
					{block.avatarUrl && isSafeUrl(block.avatarUrl) && (
						<img
							src={block.avatarUrl}
							alt={block.author ?? ""}
							className="h-10 w-10 rounded-full object-cover"
							loading="lazy"
						/>
					)}
					<div>
						{block.author && (
							<cite className="block text-sm font-semibold not-italic text-foreground">
								{block.author}
							</cite>
						)}
						{(block.role || block.company) && (
							<span className="text-sm text-muted-foreground">
								{[block.role, block.company].filter(Boolean).join(", ")}
							</span>
						)}
					</div>
				</figcaption>
			)}
		</figure>
	);
}
