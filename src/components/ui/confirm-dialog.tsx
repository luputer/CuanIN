"use client"

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
} from "~/components/ui/alert-dialog"

import { AlertDialog as AlertDialogPrimitive } from "radix-ui"
import { CircleNotchIcon } from "@phosphor-icons/react"
import React from "react"
import { cn } from "~/lib/utils"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void

    icon?: React.ReactNode
    title: React.ReactNode
    description?: React.ReactNode

    cancelText?: string
    cancelClassName?: string
    confirmText?: string
    confirmClassName?: string

    loading?: boolean
    onConfirm: () => void
}

export default function ConfirmDialog({
    open,
    onOpenChange,

    icon,
    title,
    description,

    cancelText = "Batal",
    cancelClassName = "border-slate-300 text-slate-600 hover:bg-slate-100",
    confirmText = "Lanjutkan",
    confirmClassName = "bg-slate-900 hover:bg-slate-800 text-white",

    loading = false,
    onConfirm,
}: Props) {
    const baseBtnStyle = "inline-flex items-center justify-center px-4 h-9 text-sm font-medium transition-all active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none border"

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="text-center sm:max-w-md rounded-xl">

                {/* ICON (optional) */}
                {icon && (
                    <div className="flex justify-center mb-2">
                        {icon}
                    </div>
                )}

                {/* TITLE */}
                <AlertDialogTitle className="text-lg font-semibold text-slate-900">
                    {title}
                </AlertDialogTitle>

                {/* DESCRIPTION */}
                {description && (
                    <AlertDialogDescription className="text-sm text-slate-500 leading-relaxed">
                        {description}
                    </AlertDialogDescription>
                )}

                {/* BUTTONS */}
                <AlertDialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">

                    <AlertDialogPrimitive.Cancel
                        className={cn(baseBtnStyle, "w-full sm:w-28 rounded-lg outline-none cursor-pointer", cancelClassName)}
                    >
                        {cancelText}
                    </AlertDialogPrimitive.Cancel>

                    <AlertDialogPrimitive.Action
                        className={cn(baseBtnStyle, "w-full sm:w-28 rounded-lg outline-none cursor-pointer", confirmClassName)}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <CircleNotchIcon className="w-4 h-4 animate-spin mr-2" />
                                Loading...
                            </>
                        ) : (
                            confirmText
                        )}
                    </AlertDialogPrimitive.Action>

                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}