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
    confirmClassName = "bg-red-400 hover:bg-red-500 text-white",

    loading = false,
    onConfirm,
}: Props) {
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
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-md rounded-xl border-2 border-slate-900 shadow-[1.5px_1.5px_0px_#0f172a] p-6 bg-white dark:bg-slate-950 dark:border-white dark:shadow-[1.5px_1.5px_0px_#ffffff] text-left gap-0">

                <div className="flex gap-4 items-start">
                    {/* ICON (optional) */}
                    {icon && (
                        <div className="flex-shrink-0">
                            {icon}
                        </div>
                    )}

                    <div className="space-y-1.5 flex-1 min-w-0">
                        {/* TITLE */}
                        <AlertDialogTitle className="text-xl font-semibold text-slate-900 dark:text-white leading-tight">
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
                                <CircleNotchIcon className="size-4 animate-spin mr-2" />
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
