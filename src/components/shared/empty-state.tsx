import { TableRow, TableCell } from "~/components/ui/table";
import { cn } from "~/lib/utils";

interface EmptyStateProps {
    icon?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}

export function TableEmptyState({ colSpan, icon, title, description, action, className }: EmptyStateProps & { colSpan: number }) {
    return (
        <TableRow className="text-center">
            <TableCell colSpan={colSpan} className={cn("py-20", className)}>
                <div className="flex flex-col items-center justify-center gap-2">
                    {icon && <div className="text-slate-300 mb-2">{icon}</div>}
                    {title && <h3 className="text-lg font-semibold text-slate-700">{title}</h3>}
                    {description && <div className="text-slate-500">{description}</div>}
                    {action && <div className="mt-2">{action}</div>}
                </div>
            </TableCell>
        </TableRow>
    );
}

export function MobileEmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn("text-center py-8 bg-white border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center gap-2", className)}>
            {icon && <div className="text-slate-300 mb-2">{icon}</div>}
            {title && <h3 className="text-lg font-semibold text-slate-700">{title}</h3>}
            {description && <div className="text-slate-500">{description}</div>}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
