"use client"

import ConfirmDialog from "~/components/shared/confirm-dialog"
import { Trash } from "@phosphor-icons/react"
import React from "react"

type DeleteConfirmDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    itemName?: string
    loading?: boolean
    onConfirm: () => void
}

export default function DeleteConfirmDialog({
    open,
    onOpenChange,
    title,
    itemName,
    loading = false,
    onConfirm,
}: DeleteConfirmDialogProps) {
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            icon={<Trash size={60} className="bg-red-100 rounded-full p-4 text-red-500" weight="fill" />}
            title={title}
            description={
                <>
                    Kamu yakin ingin menghapus {" "}
                    {itemName ? (
                        <span className="font-semibold text-slate-800">&quot;{itemName}&quot;</span>
                    ) : (
                        "item ini"
                    )}?
                    <br />
                    Tindakan ini tidak bisa dibatalkan.
                </>
            }
            confirmText="Ya, Hapus"
            confirmClassName="bg-red-500 hover:bg-red-600 text-white"
            loading={loading}
            onConfirm={onConfirm}
        />
    )
}
