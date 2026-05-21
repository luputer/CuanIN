"use client";

import React from "react";
import { TooltipProvider } from "~/components/ui/tooltip";
import { useAdminCreators } from "~/hooks/admin/use-admin-creators";
import { CreatorToolbar } from "~/components/admin/creators/creator-toolbar";
import { CreatorTable } from "~/components/admin/creators/creator-table";
import { DeleteCreatorDialog } from "~/components/admin/creators/delete-creator-dialog";

export default function AdminCreatorsPage() {
    const {
        search,
        page,
        limit,
        sortBy,
        sortOrder,
        deleteId,
        setSearch,
        setPage,
        setLimit,
        setDeleteId,
        handleSort,
        creators,
        total,
        totalPages,
        isLoading,
        creatorToDelete,
        deleteCreator,
        debouncedSearch,
    } = useAdminCreators();

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-slate-50">
                    <div className="sticky top-[74px] bg-slate-50 z-40 -mx-4 px-4 mb-2">
                        <div className="text-2xl font-bold mb-2 text-cyan-600">Daftar Kreator</div>
                        <div className="text-sm font-regular text-slate-600">Pantau dan kelola semua data kreator di platform CuanIN.</div>
                    </div>
                </div>

                <CreatorToolbar
                    search={search}
                    onSearchChange={setSearch}
                />

                <CreatorTable
                    creators={creators as any}
                    isLoading={isLoading}
                    page={page}
                    limit={limit}
                    total={total}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onDelete={setDeleteId}
                    debouncedSearch={debouncedSearch}
                />

                <DeleteCreatorDialog
                    open={!!deleteId}
                    onOpenChange={(open) => !open && setDeleteId(null)}
                    creatorName={creatorToDelete?.name}
                    loading={deleteCreator.isPending}
                    onConfirm={() => {
                        if (deleteId) deleteCreator.mutate({ id: deleteId });
                    }}
                />
            </div>
        </TooltipProvider>
    );
}
