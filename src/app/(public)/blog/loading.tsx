export default function BlogLoading() {
	return (
		<div className="mx-auto max-w-5xl px-6 py-16">
			{/* Title skeleton */}
			<div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
			<div className="mt-2 h-5 w-64 animate-pulse rounded-md bg-muted" />

			{/* Post cards skeleton */}
			<div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="space-y-3">
						<div className="aspect-video animate-pulse rounded-lg bg-muted" />
						<div className="h-5 w-3/4 animate-pulse rounded-md bg-muted" />
						<div className="h-4 w-full animate-pulse rounded-md bg-muted" />
						<div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
					</div>
				))}
			</div>
		</div>
	);
}
