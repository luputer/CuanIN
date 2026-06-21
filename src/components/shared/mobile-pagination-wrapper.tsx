interface MobilePaginationWrapperProps {
    children: React.ReactNode;
}

export function MobilePaginationWrapper({ children }: MobilePaginationWrapperProps) {
    return (
        <div className="sm:hidden bg-white border border-slate-800 rounded-xl p-4 shadow-[1.5px_1.5px_0px_#000]">
            {children}
        </div>
    );
}
