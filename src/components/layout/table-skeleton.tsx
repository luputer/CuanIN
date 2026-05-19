import { Skeleton } from "~/components/ui/skeleton";
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
} from "~/components/ui/table";

export function TableSkeleton({
    columns = 6,
    hasToolbar = true,
}: {
    columns?: number;
    hasToolbar?: boolean;
}) {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-slate-50">
                <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-80" />
                </div>
            </div>

            {/* Toolbar */}
            {hasToolbar && (
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <Skeleton className="h-10 w-full md:w-96 rounded-full" />
                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-32 rounded-full hidden md:block" />
                        <Skeleton className="h-10 w-32 rounded-full hidden md:block" />
                        <Skeleton className="h-10 w-40 rounded-full" />
                    </div>
                </div>
            )}

            {/* Desktop Table (Only visible on desktop/tablet) */}
            <div className="hidden sm:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: columns }).map((_, i) => (
                                <TableHead key={i}>
                                    <Skeleton className="h-4 w-20" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                    <TableCell key={colIndex}>
                                        <Skeleton className="h-4 w-full max-w-[120px]" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards (Only visible on mobile) */}
            <div className="space-y-4 sm:hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <Skeleton className="h-4 w-8" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <div className="flex gap-3">
                            <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-3 w-1/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
