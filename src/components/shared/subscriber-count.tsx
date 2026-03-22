import { getSubscriberCount } from "@/lib/subscribers";

export async function SubscriberCount() {
	const count = await getSubscriberCount();

	return (
		<p className="text-sm text-muted-foreground">
			{count.toLocaleString()} {count === 1 ? "person" : "people"} already on
			the waitlist
		</p>
	);
}
