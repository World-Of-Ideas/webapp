import type { ContentBlock } from "@/types/content";
import Link from "next/link";

interface ParagraphBlockProps {
	block: ContentBlock;
}

export function ParagraphBlock({ block }: ParagraphBlockProps) {
	if (!block.text) return null;

	return (
		<p>
			{block.text}
			{block.link && block.linkText && (
				<>
					{" "}
					<Link href={block.link} className="text-primary underline underline-offset-4 hover:text-primary/80">
						{block.linkText}
					</Link>
				</>
			)}
		</p>
	);
}
