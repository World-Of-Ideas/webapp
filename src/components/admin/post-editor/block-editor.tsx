"use client";

import type { ContentBlock } from "@/types/content";
import { ParagraphEditor } from "./paragraph-editor";
import { HeadingEditor } from "./heading-editor";
import { ListEditor } from "./list-editor";
import { ImageEditor } from "./image-editor";
import { CalloutEditor } from "./callout-editor";
import { QuoteEditor } from "./quote-editor";
import { TableEditor } from "./table-editor";
import { CtaEditor } from "./cta-editor";
import { DownloadEditor } from "./download-editor";
import { VideoEditor } from "./video-editor";
import { TestimonialEditor } from "./testimonial-editor";
import { CodeEditor } from "./code-editor";
import { ButtonGroupEditor } from "./button-group-editor";
import { FeatureGridEditor } from "./feature-grid-editor";
import { LogoGridEditor } from "./logo-grid-editor";
import { StatsCounterEditor } from "./stats-counter-editor";
import { DividerEditor } from "./divider-editor";
import { AccordionEditor } from "./accordion-editor";
import { ImageGalleryEditor } from "./image-gallery-editor";
import { EmbedEditor } from "./embed-editor";
import { BannerEditor } from "./banner-editor";
import { ComparisonTableEditor } from "./comparison-table-editor";
import { TimelineEditor } from "./timeline-editor";
import { SpacerEditor } from "./spacer-editor";
import { TabsEditor } from "./tabs-editor";
import { ReviewEditor } from "./review-editor";
import { EmailCaptureEditor } from "./email-capture-editor";
import { TocEditor } from "./toc-editor";

interface BlockEditorProps {
	block: ContentBlock;
	onChange: (block: ContentBlock) => void;
}

export function BlockEditor({ block, onChange }: BlockEditorProps) {
	switch (block.type) {
		case "paragraph":
			return <ParagraphEditor block={block} onChange={onChange} />;
		case "heading":
			return <HeadingEditor block={block} onChange={onChange} />;
		case "list":
			return <ListEditor block={block} onChange={onChange} />;
		case "image":
			return <ImageEditor block={block} onChange={onChange} />;
		case "callout":
			return <CalloutEditor block={block} onChange={onChange} />;
		case "quote":
			return <QuoteEditor block={block} onChange={onChange} />;
		case "table":
			return <TableEditor block={block} onChange={onChange} />;
		case "cta":
			return <CtaEditor block={block} onChange={onChange} />;
		case "download":
			return <DownloadEditor block={block} onChange={onChange} />;
		case "video":
			return <VideoEditor block={block} onChange={onChange} />;
		case "testimonial":
			return <TestimonialEditor block={block} onChange={onChange} />;
		case "code":
			return <CodeEditor block={block} onChange={onChange} />;
		case "buttonGroup":
			return <ButtonGroupEditor block={block} onChange={onChange} />;
		case "featureGrid":
			return <FeatureGridEditor block={block} onChange={onChange} />;
		case "logoGrid":
			return <LogoGridEditor block={block} onChange={onChange} />;
		case "statsCounter":
			return <StatsCounterEditor block={block} onChange={onChange} />;
		case "divider":
			return <DividerEditor block={block} onChange={onChange} />;
		case "accordion":
			return <AccordionEditor block={block} onChange={onChange} />;
		case "imageGallery":
			return <ImageGalleryEditor block={block} onChange={onChange} />;
		case "embed":
			return <EmbedEditor block={block} onChange={onChange} />;
		case "banner":
			return <BannerEditor block={block} onChange={onChange} />;
		case "comparisonTable":
			return <ComparisonTableEditor block={block} onChange={onChange} />;
		case "timeline":
			return <TimelineEditor block={block} onChange={onChange} />;
		case "spacer":
			return <SpacerEditor block={block} onChange={onChange} />;
		case "tabs":
			return <TabsEditor block={block} onChange={onChange} />;
		case "review":
			return <ReviewEditor block={block} onChange={onChange} />;
		case "emailCapture":
			return <EmailCaptureEditor block={block} onChange={onChange} />;
		case "tableOfContents":
			return <TocEditor block={block} onChange={onChange} />;
		default:
			return (
				<p className="text-sm text-muted-foreground">
					Unknown block type: {(block as ContentBlock).type}
				</p>
			);
	}
}
