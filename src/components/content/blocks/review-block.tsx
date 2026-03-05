import type { ContentBlock } from "@/types/content";
import { isSafeUrl } from "@/lib/utils";

interface ReviewBlockProps {
	block: ContentBlock;
}

export function ReviewBlock({ block }: ReviewBlockProps) {
	if (!block.text) return null;

	const rating = block.rating ?? 5;

	return (
		<figure className="rounded-lg border bg-card p-6">
			<div className="mb-3 flex gap-1" aria-label={`Rating: ${rating} out of 5 stars`}>
				{Array.from({ length: 5 }, (_, i) => (
					<svg
						key={i}
						className={i < rating ? "h-5 w-5 text-yellow-400" : "h-5 w-5 text-muted-foreground/30"}
						fill="currentColor"
						viewBox="0 0 20 20"
						aria-hidden="true"
					>
						<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.065 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.284-3.957z" />
					</svg>
				))}
			</div>
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
