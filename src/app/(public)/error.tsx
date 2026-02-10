"use client";

export default function PublicError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="mx-auto max-w-3xl px-6 py-24 text-center">
			<h1 className="text-3xl font-bold">Something went wrong</h1>
			<p className="mt-2 text-muted-foreground">
				An unexpected error occurred. Please try again.
			</p>
			{error.digest && (
				<p className="mt-1 text-xs text-muted-foreground">
					Error ID: {error.digest}
				</p>
			)}
			<button
				onClick={reset}
				className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
			>
				Try again
			</button>
		</div>
	);
}
