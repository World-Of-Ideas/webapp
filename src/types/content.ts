export type ContentBlockType =
	| "paragraph"
	| "heading"
	| "list"
	| "image"
	| "callout"
	| "quote"
	| "table"
	| "cta"
	| "download"
	| "video"
	| "testimonial"
	| "code"
	| "buttonGroup"
	| "featureGrid"
	| "logoGrid"
	| "statsCounter"
	| "divider"
	| "accordion"
	| "imageGallery"
	| "embed"
	| "banner"
	| "comparisonTable"
	| "timeline"
	| "tabs"
	| "review"
	| "emailCapture"
	| "tableOfContents"
	| "spacer";

export interface ContentBlock {
	type: ContentBlockType;
	// paragraph, heading, callout, quote, cta, banner
	text?: string;
	// paragraph — optional inline link
	link?: string;
	linkText?: string;
	// heading — level (h2, h3, h4)
	level?: 2 | 3 | 4;
	// image — R2 URL + alt text
	image?: string;
	alt?: string;
	// list — items + ordered flag
	items?: string[];
	ordered?: boolean;
	// callout — variant
	variant?: "info" | "tip" | "warning";
	// table — headers + rows
	headers?: string[];
	rows?: string[][];
	// download — file URL + button label
	downloadUrl?: string;
	downloadLabel?: string;
	// video — embed URL (YouTube/Vimeo)
	videoUrl?: string;
	// testimonial — social proof
	author?: string;
	role?: string;
	company?: string;
	avatarUrl?: string;
	// code — syntax block
	code?: string;
	language?: string;
	// buttonGroup — CTA buttons
	buttons?: { label: string; href: string; variant: "primary" | "outline" | "link" }[];
	// featureGrid — feature cards
	features?: { title: string; description: string; icon?: string }[];
	// shared layout — column count
	columns?: 2 | 3 | 4 | 5 | 6;
	// logoGrid — partner/customer logos
	logos?: { image: string; alt: string; href?: string }[];
	// statsCounter — metrics
	stats?: { value: string; label: string; prefix?: string; suffix?: string }[];
	// divider — separator style
	dividerStyle?: "line" | "dots" | "gradient";
	// accordion — collapsible items
	accordionItems?: { title: string; content: string }[];
	// imageGallery — multi-image grid
	gallery?: { url: string; alt: string; caption?: string }[];
	// embed — iframe
	embedUrl?: string;
	embedHeight?: number;
	// banner — background style
	bannerVariant?: "solid" | "gradient" | "image";
	bannerBackground?: string;
	// comparisonTable — feature comparison
	comparisonColumns?: string[];
	comparisonRows?: { feature: string; values: (boolean | string)[] }[];
	highlightColumn?: number;
	// timeline — events
	timelineEvents?: { date: string; title: string; description: string }[];
	// spacer — vertical whitespace
	spacerSize?: "sm" | "md" | "lg" | "xl";
	// tabs — tabbed content panels
	tabs?: { label: string; content: string }[];
	// review — star rating
	rating?: 1 | 2 | 3 | 4 | 5;
	// (reuses text, author, role, company, avatarUrl)
	// emailCapture — inline email signup
	emailCaptureHeading?: string;
	emailCapturePlaceholder?: string;
	emailCaptureButtonText?: string;
	// tableOfContents — auto-generated from headings
	tocTitle?: string;
	tocMaxLevel?: 2 | 3 | 4;
}

export interface PricingTier {
	name: string;
	price: string;
	period: string;
	description: string;
	features: string[];
	cta: string;
	ctaUrl: string;
	highlighted: boolean;
}

export interface ChangelogEntry {
	date: string;
	title: string;
	description: string;
	tags: string[];
}

export type PageLayout = "default" | "landing" | "listing" | "pillar";

export interface SectionListingConfig {
	gridCols: 2 | 3;
	cardVariant: "default" | "compact";
	itemsPerPage: number;
	showBadges: boolean;
	cardLabel: string;
}

export interface FAQ {
	question: string;
	answer: string;
}

export interface RelatedPage {
	title: string;
	description: string;
	href: string;
}
