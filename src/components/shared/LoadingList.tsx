import { Skeleton } from "../ui/skeleton";

interface LoadingListProps {
	headerHeight?: string;
	itemCount?: number;
}

/**
 * Reusable loading skeleton for list views
 */
export function LoadingList({
	headerHeight = "h-8",
	itemCount = 6,
}: LoadingListProps) {
	return (
		<div className="flex flex-col h-full overflow-hidden">
			<div className="shrink-0 mb-6">
				<Skeleton className={`${headerHeight} w-48`} />
			</div>
			<div className="flex-1 overflow-y-auto">
				<div className="flex flex-col gap-4">
					{Array.from({ length: itemCount }).map((_, i) => (
						<Skeleton key={i} className="h-24 w-full" />
					))}
				</div>
			</div>
		</div>
	);
}
