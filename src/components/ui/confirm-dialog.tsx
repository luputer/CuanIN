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
    cancelClassName = "bg-white hover:bg-slate-50 text-slate-900",
    confirmText = "Lanjutkan",
    confirmClassName = "bg-red-500 hover:bg-red-600 text-white",

    loading = false,
    onConfirm,
}: Props) {
    const baseBtnStyle = "inline-flex items-center justify-center px-4 h-10 text-sm font-bold transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[0px] active:translate-y-[0px] disabled:opacity-50 disabled:pointer-events-none border-2 border-slate-900 dark:border-white shadow-[3px_3px_0px_#0f172a] hover:shadow-[5px_5px_0px_#0f172a] active:shadow-[0px_0px_0px_#0f172a] dark:shadow-white dark:hover:shadow-[5px_5px_0px_#ffffff] dark:active:shadow-none"

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md rounded-xl border-2 border-slate-900 shadow-[6px_6px_0px_#0f172a] p-6 bg-white dark:bg-slate-950 dark:border-white dark:shadow-[6px_6px_0px_#ffffff] text-left gap-0">

                <div className="flex gap-4 items-start">
                    {/* ICON (optional) */}
                    {icon && (
                        <div className="flex-shrink-0 border-2 border-slate-900 dark:border-white rounded-xl overflow-hidden shadow-[2px_2px_0px_#0f172a] dark:shadow-white">
                            {icon}
                        </div>
                    )}

                    <div className="space-y-1.5 flex-1 min-w-0">
                        {/* TITLE */}
                        <AlertDialogTitle className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                            {title}
                        </AlertDialogTitle>

                        {/* DESCRIPTION */}
                        {description && (
                            <AlertDialogDescription className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                                {description}
                            </AlertDialogDescription>
                        )}
                    </div>
                </div>

                {/* BUTTONS */}
                <AlertDialogFooter className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

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