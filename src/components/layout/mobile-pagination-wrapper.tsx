interface MobilePaginationWrapperProps {
    children: React.ReactNode;
}

export function MobilePaginationWrapper({ children }: MobilePaginationWrapperProps) {
    return (
        <div className="bg-white border border-slate-800 rounded-xl p-4 shadow-[1.5px_1.5px_0px_rgba(29,41,61)]">
            {children}
        </div>
    );
}
