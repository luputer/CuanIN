"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, Copy } from "lucide-react" // Alternatively use phosphor if preferred. Let's check phosphor-icons first
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

    const baseBtnStyle = "inline-flex items-center justify-center px-4 h-9 text-sm font-medium transition-all active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none border outline-none cursor-pointer"

    return (
        <AlertDialog open={open} onOpenChange={(val) => {
            if (!val) handleClose()
        }}>
            <AlertDialogContent className="text-center sm:max-w-md rounded-xl">
                {/* ICON */}
                <div className="flex justify-center mb-2">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircleIcon size={24} weight="fill" />
                    </div>
                </div>

                {/* TITLE */}
                <AlertDialogTitle className="text-lg font-semibold text-slate-900">
                    Produk Berhasil Dibuat!
                </AlertDialogTitle>

                {/* DESCRIPTION */}
                <AlertDialogDescription className="text-sm text-slate-500 leading-relaxed">
                    <span className="text-slate-800 font-bold">"{productName}"</span> telah berhasil ditambahkan ke katalog Anda.
                </AlertDialogDescription>

                {/* BUTTONS */}
                <div className="mt-4 flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className={cn(baseBtnStyle, "w-full rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white border-transparent")}
                    >
                        <CopyIcon className="w-4 h-4 mr-2" weight="bold" />
                        Salin Link
                    </button>

                    <button
                        type="button"
                        onClick={handleClose}
                        className={cn(baseBtnStyle, "w-full rounded-lg border-slate-300 text-slate-600 hover:bg-slate-100")}
                    >
                        Tutup
                    </button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}
