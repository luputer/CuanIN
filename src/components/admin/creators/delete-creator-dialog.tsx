"use client";

import React from "react";
import { TrashIcon } from "@phosphor-icons/react";
import ConfirmDialog from "~/components/ui/confirm-dialog";

type DeleteCreatorDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    creatorName?: string | null;
    loading: boolean;
    onConfirm: () => void;
};

export const DeleteCreatorDialog: React.FC<DeleteCreatorDialogProps> = ({
    open,
    onOpenChange,
    creatorName,
    loading,
    onConfirm,
}) => {
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            icon={<TrashIcon size={52} className="bg-red-100 rounded-full p-3 text-red-500" weight="regular" />}
            title="Hapus Kreator?"
            description={
                <>
                    Kamu yakin ingin menghapus kreator {" "}
                    <span className="font-semibold text-slate-800">&quot;{creatorName}&quot;</span>?
                    <br />
                    Tindakan ini tidak bisa dibatalkan.
                </>
            }
            confirmText="Ya, Hapus"
            confirmClassName="bg-red-500 hover:bg-red-600 text-white"
            loading={loading}
            onConfirm={onConfirm}
        />
    );
};
