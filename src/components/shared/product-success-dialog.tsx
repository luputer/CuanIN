"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { CheckCircleIcon, CopyIcon } from "@phosphor-icons/react"
import { toast } from "sonner"
import { api } from "~/trpc/react"
import { cn } from "~/lib/utils"

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
} from "~/components/ui/alert-dialog"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    productName: string
    productSlug: string
    redirectUrl: string
}

export function ProductSuccessDialog({
    open,
    onOpenChange,
    productName,
    productSlug,
    redirectUrl,
}: Props) {
    const router = useRouter()
    const { data: profile } = api.profile.get.useQuery(undefined, {
        enabled: open
    })

    const handleCopyLink = () => {
        const catalogSlug = profile?.catalog?.slug
        if (!catalogSlug) {
            toast.error("Gagal menyalin link: memuat data katalog")
            return
        }
        const host = window.location.origin
        const publicUrl = `${host}/${catalogSlug}/${productSlug}`
        void navigator.clipboard.writeText(publicUrl)
        toast.success("Link produk berhasil disalin!")
    }

    const handleClose = () => {
        onOpenChange(false)
        router.push(redirectUrl)
    }

    const baseBtnStyle =
        "inline-flex items-center justify-center px-4 h-10 text-sm font-semibold " +
        "border-1 border-slate-800 " +
        "shadow-[1px_1px_0px_rgba(29,41,61)] " +
        "transition-all duration-200 ease-out " +
        "hover:translate-x-px hover:translate-y-px hover:shadow-none " +
        "active:translate-x-px active:translate-y-px active:shadow-none " +
        "disabled:opacity-60 disabled:cursor-not-allowed " +
        "disabled:hover:translate-x-0 disabled:hover:translate-y-0 cursor-pointer";

    return (
        <AlertDialog open={open} onOpenChange={(val) => {
            if (!val) handleClose()
        }}>
            <AlertDialogContent className="text-center sm:max-w-md rounded-xl shadow-[1.5px_1.5px_0px_#0f172a] border-2 border-slate-800">
                {/* ICON */}
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircleIcon size={28} weight="fill" />
                    </div>
                </div>

                {/* TITLE */}
                <AlertDialogTitle className="text-lg font-semibold text-slate-900">
                    Produk Berhasil Dibuat!
                </AlertDialogTitle>

                {/* DESCRIPTION */}
                <AlertDialogDescription className="text-sm font-medium text-slate-600 leading-relaxed">
                    <span className="text-slate-800 font-bold">&quot;{productName}&quot;</span> telah berhasil ditambahkan ke katalog Anda.
                </AlertDialogDescription>

                {/* BUTTONS */}
                <div className="mt-6 flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className={cn(baseBtnStyle, "w-full rounded-lg outline-none cursor-pointer", "bg-cyan-600 text-white")}
                    >
                        <CopyIcon className="w-4 h-4 mr-2" weight="bold" />
                        Salin Link
                    </button>

                    <button
                        type="button"
                        onClick={handleClose}
                        className={cn(baseBtnStyle, "w-full rounded-lg outline-none cursor-pointer", "bg-white hover:bg-slate-50 text-slate-900")}
                    >
                        Tutup
                    </button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}
