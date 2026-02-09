interface SendEmailOptions {
	from: string;
	to: string;
	subject: string;
	html: string;
	headers?: Record<string, string>;
}

export async function sendEmail(apiKey: string, options: SendEmailOptions): Promise<void> {
	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: options.from,
			to: [options.to],
			subject: options.subject,
			html: options.html,
			headers: options.headers,
		}),
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Resend API error (${response.status}): ${text}`);
	}
}
