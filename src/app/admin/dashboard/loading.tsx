import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="space-y-6">
			{/* Page title */}
			<div>
				<Skeleton className="h-8 w-48 mb-2" />
				<Skeleton className="h-4 w-80" />
			</div>

			{/* TOP CARDS — 4 columns */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						key={i}
						className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3"
					>
						{/* icon placeholder */}
						<Skeleton className="w-8 h-8 rounded-full" />
						{/* title */}
						<Skeleton className="h-4 w-24" />
						{/* value */}
						<Skeleton className="h-6 w-32" />
						{/* footer */}
						<div className="flex justify-between mt-1">
							<Skeleton className="h-3 w-20" />
							<Skeleton className="h-5 w-10 rounded-full" />
						</div>
					</div>
				))}
			</div>

			{/* CHART ROW 1 — 2/3 + 1/3 */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
				{/* Area chart placeholder */}
				<div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
					<Skeleton className="h-6 w-48 mb-6" />
					<Skeleton className="h-[300px] w-full rounded-lg" />
				</div>
				{/* Bar chart placeholder */}
				<div className="col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
					<Skeleton className="h-6 w-36 mb-6" />
					<Skeleton className="h-[300px] w-full rounded-lg" />
				</div>
			</div>

			{/* CHART ROW 2 — 3/5 + 2/5 */}
			<div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
				{/* Traffic chart */}
				<div className="col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
					<Skeleton className="h-6 w-40 mb-6" />
					<Skeleton className="h-[300px] w-full rounded-lg" />
				</div>
				{/* Buyer chart */}
				<div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
					<Skeleton className="h-6 w-36 mb-6" />
					<Skeleton className="h-[300px] w-full rounded-lg" />
				</div>
			</div>
		</div>
	);
}
