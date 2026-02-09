export type EmailJob =
	| { type: "waitlist_confirmation"; payload: { email: string; name: string; position: number; referralCode: string } }
	| { type: "referral_notification"; payload: { email: string; name: string; newPosition: number } }
	| { type: "giveaway_confirmation"; payload: { email: string } }
	| { type: "contact_receipt"; payload: { name: string; email: string; message: string } };

export async function enqueueEmail(queue: Queue, job: EmailJob): Promise<void> {
	await queue.send(job);
}
