export default function AdminLoading() {
	return (
		<div className="space-y-6" role="status">
			<span className="sr-only">Loading...</span>
			{/* Title skeleton */}
			<div className="h-8 w-48 animate-pulse rounded-md bg-muted" />

			{/* Content skeleton */}
			<div className="space-y-4">
				<div className="h-4 w-full animate-pulse rounded-md bg-muted" />
				<div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
				<div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
			</div>

			{/* Table skeleton */}
			<div className="rounded-lg border">
				<div className="border-b p-4">
					<div className="h-4 w-full animate-pulse rounded-md bg-muted" />
				</div>
				{Array.from({ length: 5 }).map((_, i) => (
					<div key={i} className="border-b p-4 last:border-b-0">
						<div className="h-4 w-full animate-pulse rounded-md bg-muted" />
					</div>
				))}
			</div>
		</div>
	);
}
