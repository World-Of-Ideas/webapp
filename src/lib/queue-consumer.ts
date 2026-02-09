import type { EmailJob } from "./queue";
import { sendEmail } from "./resend";
import { generateUnsubscribeToken } from "./waitlist";

async function buildUnsubscribeHeaders(email: string, env: CloudflareEnv) {
	const secret = (env as unknown as Record<string, unknown>).UNSUBSCRIBE_SECRET as string;
	const token = await generateUnsubscribeToken(email, secret);
	const url = `${env.SITE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
	return {
		"List-Unsubscribe": `<${url}>`,
		"List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
	};
}

export async function handleEmailQueue(
	batch: MessageBatch<EmailJob>,
	env: CloudflareEnv,
): Promise<void> {
	for (const message of batch.messages) {
		try {
			const job = message.body;

			switch (job.type) {
				case "waitlist_confirmation": {
					const headers = await buildUnsubscribeHeaders(job.payload.email, env);
					await sendEmail(env.RESEND_API_KEY, {
						from: env.FROM_EMAIL,
						to: job.payload.email,
						subject: "You're on the waitlist!",
						html: `<p>Hi ${job.payload.name},</p>
<p>You're #${job.payload.position} on the waiting list!</p>
<p>Share your referral link to move up: <a href="${env.SITE_URL}/waitlist/${job.payload.referralCode}">${env.SITE_URL}/waitlist/${job.payload.referralCode}</a></p>`,
						headers,
					});
					break;
				}

				case "referral_notification": {
					const headers = await buildUnsubscribeHeaders(job.payload.email, env);
					await sendEmail(env.RESEND_API_KEY, {
						from: env.FROM_EMAIL,
						to: job.payload.email,
						subject: "A friend joined via your referral!",
						html: `<p>Hi ${job.payload.name},</p>
<p>Someone just joined using your referral link! Your effective position is now #${job.payload.newPosition}.</p>`,
						headers,
					});
					break;
				}

				case "giveaway_confirmation":
					await sendEmail(env.RESEND_API_KEY, {
						from: env.FROM_EMAIL,
						to: job.payload.email,
						subject: "You're entered in the giveaway!",
						html: `<p>You've been entered into the giveaway. Complete bonus actions to increase your chances!</p>`,
					});
					break;

				case "contact_receipt":
					await sendEmail(env.RESEND_API_KEY, {
						from: env.FROM_EMAIL,
						to: env.CONTACT_EMAIL,
						subject: `New contact form submission from ${job.payload.name}`,
						html: `<p><strong>From:</strong> ${job.payload.name} (${job.payload.email})</p>
<p><strong>Message:</strong></p>
<p>${job.payload.message}</p>`,
					});
					break;
			}

			message.ack();
		} catch {
			message.retry();
		}
	}
}
