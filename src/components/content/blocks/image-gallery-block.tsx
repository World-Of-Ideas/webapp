import type { ContentBlock } from "@/types/content";
import { cn, isSafeUrl } from "@/lib/utils";

interface ImageGalleryBlockProps {
	block: ContentBlock;
}

const columnClasses: Record<number, string> = {
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
	5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
	6: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6",
};

export function ImageGalleryBlock({ block }: ImageGalleryBlockProps) {
	if (!block.gallery || block.gallery.length === 0) return null;

	const cols = block.columns && columnClasses[block.columns] ? block.columns : 3;

	return (
		<div className={cn("not-prose my-6 grid gap-4", columnClasses[cols])}>
			{block.gallery.map((item, i) => {
				if (!item.url || !isSafeUrl(item.url)) return null;

				return (
					<figure key={i}>
						<img
							src={item.url}
							alt={item.alt || ""}
							className="aspect-square w-full rounded-lg object-cover"
							loading="lazy"
						/>
						{item.caption && (
							<figcaption className="mt-2 text-center text-xs text-muted-foreground">
								{item.caption}
							</figcaption>
						)}
					</figure>
				);
			})}
		</div>
	);
}
