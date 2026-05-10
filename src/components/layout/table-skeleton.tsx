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
        <div className="space-y-6">
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

            {/* Table */}
            <div>
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
        </div>
    );
}
