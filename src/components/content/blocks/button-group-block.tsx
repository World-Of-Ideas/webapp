import type { ContentBlock } from "@/types/content";
import { cn, isSafeUrl } from "@/lib/utils";

interface ButtonGroupBlockProps {
	block: ContentBlock;
}

const variantStyles: Record<string, string> = {
	primary: "rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90",
	outline: "rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted",
	link: "text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80",
};

export function ButtonGroupBlock({ block }: ButtonGroupBlockProps) {
	if (!block.buttons || block.buttons.length === 0) return null;

	return (
		<div className="my-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
			{block.buttons.map((button, i) => {
				if (!button.label || !button.href || !isSafeUrl(button.href)) return null;

				const variant = button.variant && variantStyles[button.variant] ? button.variant : "primary";

				return (
					<a
						key={i}
						href={button.href}
						className={cn("inline-block transition-opacity", variantStyles[variant])}
					>
						{button.label}
					</a>
				);
			})}
		</div>
	);
}
