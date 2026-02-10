"use client";

import type { FAQ } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FaqEditorProps {
	faqs: FAQ[];
	onChange: (faqs: FAQ[]) => void;
}

export function FaqEditor({ faqs, onChange }: FaqEditorProps) {
	function updateFaq(index: number, field: keyof FAQ, value: string) {
		const updated = [...faqs];
		updated[index] = { ...updated[index], [field]: value };
		onChange(updated);
	}

	function addFaq() {
		onChange([...faqs, { question: "", answer: "" }]);
	}

	function removeFaq(index: number) {
		onChange(faqs.filter((_, i) => i !== index));
	}

	function moveFaq(index: number, direction: -1 | 1) {
		const target = index + direction;
		if (target < 0 || target >= faqs.length) return;
		const updated = [...faqs];
		[updated[index], updated[target]] = [updated[target], updated[index]];
		onChange(updated);
	}

	return (
		<div className="space-y-4">
			{faqs.map((faq, i) => (
				<div key={i} className="rounded-lg border p-4 space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-muted-foreground">
							FAQ {i + 1}
						</span>
						<div className="flex items-center gap-1">
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								onClick={() => moveFaq(i, -1)}
								disabled={i === 0}
								title="Move up"
								aria-label="Move FAQ up"
							>
								&#8593;
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								onClick={() => moveFaq(i, 1)}
								disabled={i === faqs.length - 1}
								title="Move down"
								aria-label="Move FAQ down"
							>
								&#8595;
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								onClick={() => removeFaq(i)}
								title="Remove FAQ"
								aria-label="Remove FAQ"
							>
								&times;
							</Button>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor={`faq-q-${i}`}>Question</Label>
						<Input
							id={`faq-q-${i}`}
							value={faq.question}
							onChange={(e) => updateFaq(i, "question", e.target.value)}
							placeholder="Frequently asked question..."
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor={`faq-a-${i}`}>Answer</Label>
						<Textarea
							id={`faq-a-${i}`}
							value={faq.answer}
							onChange={(e) => updateFaq(i, "answer", e.target.value)}
							placeholder="Answer to the question..."
							className="min-h-[60px]"
						/>
					</div>
				</div>
			))}

			<Button type="button" variant="outline" onClick={addFaq}>
				Add FAQ
			</Button>
		</div>
	);
}
