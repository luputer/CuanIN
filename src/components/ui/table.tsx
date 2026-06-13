"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { CaretDownIcon, CaretLeftIcon, CaretRightIcon, DotsThreeIcon, CaretUpIcon } from "@phosphor-icons/react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "~/components/ui/pagination"

export function Table({
  className,
  pagination,
  children,
  ...props
}: React.ComponentProps<"table"> & { pagination?: React.ReactNode }) {
  return (
    <div className="relative w-full bg-white border border-slate-800 shadow-[0px_1px_0px_rgba(30,27,75)] rounded-xl overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table
          className={cn("w-full table-auto text-sm text-left", className)}
          {...props}
        >
          {children}
        </table>
      </div>
      {pagination && (
        <div className="border-t border-slate-300 p-4 bg-white">
          {pagination}
        </div>
      )}
    </div>
  )
}

export function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      className={cn("bg-cyan-50", className)}
      {...props}
    />
  )
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "transition-all border-b border-slate-200",
        "even:bg-slate-50/50",
        className
      )}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "py-6 px-6 text-slate-800 font-semibold whitespace-normal border-b border-cyan-200",
        className
      )}
      {...props}
    />
  )
}

type SortableTableHeadProps<T extends string> = React.ComponentProps<"th"> & {
  label: React.ReactNode;
  field: T;
  currentSortBy: string;
  currentSortOrder: "asc" | "desc";
  onSort: (field: T) => void;
};

export function SortableTableHead<T extends string>({
  className,
  label,
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
  children,
  ...props
}: SortableTableHeadProps<T>) {
  return (
    <TableHead
      className={cn("cursor-pointer select-none hover:text-slate-900 transition-colors group", className)}
      onClick={() => onSort(field)}
      {...props}
    >
      <div className="flex items-center gap-2">
        {label}
        {children}
        <div className="flex flex-col h-4 justify-center shrink-0">
          <CaretUpIcon
            weight={currentSortBy === field && currentSortOrder === "asc" ? "bold" : "regular"}
            className={cn("w-4 h-4 -mb-1", currentSortBy === field && currentSortOrder === "asc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
          />
          <CaretDownIcon
            weight={currentSortBy === field && currentSortOrder === "desc" ? "bold" : "regular"}
            className={cn("w-4 h-4", currentSortBy === field && currentSortOrder === "desc" ? "text-slate-800" : "text-slate-400 group-hover:text-slate-400")}
          />
        </div>
      </div>
    </TableHead>
  )
}

export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      className={cn("divide-y divide-slate-200/60", className)}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      className={cn(
        "py-4 px-6 text-slate-600 whitespace-normal align-middle",
        "leading-none",
        className
      )}
      {...props}
    />
  )
}

interface TablePaginationProps {
  page: number
  totalPages: number
  limit: number
  total: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function TablePagination({
  page,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: TablePaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-500 w-full">
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={limit}
            onChange={(e) => {
              onLimitChange(Number(e.target.value))
              onPageChange(1)
            }}
            className="appearance-none bg-slate-50 border border-slate-200 rounded px-3 py-1.5 pr-8 text-slate-600 hover:bg-slate-50 focus:outline-none cursor-pointer w-20"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <CaretDownIcon className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <span className="text-slate-500 whitespace-nowrap">
          Hasil: {total > 0 ? (page - 1) * limit + 1 : 0}-
          {Math.min(page * limit, total)} dari {total}
        </span>
      </div>
      <div className="flex items-center">
        <Pagination className="justify-center sm:justify-end">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <button
                type="button"
                onClick={() => {
                  const newPage = Math.max(1, (page || 1) - 1)
                  onPageChange(newPage)
                }}
                disabled={(page || 1) <= 1}
                className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CaretLeftIcon className="size-4" />
              </button>
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  (p >= page - 1 && p <= page + 1)
              )
              .map((p, index, array) => {
                const prev = array[index - 1]
                const showEllipsis =
                  index > 0 && prev !== undefined && p - prev > 1

                return (
                  <React.Fragment key={p}>
                    {showEllipsis && (
                      <PaginationItem>
                        <div className="flex size-7 items-center justify-center">
                          <DotsThreeIcon className="size-4 text-slate-400" />
                        </div>
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <button
                        type="button"
                        onClick={() => onPageChange(p)}
                        className={`size-7 rounded-[4px] flex items-center justify-center font-medium text-xs transition-colors ${page === p ? "bg-[#00B4D8] text-white hover:bg-[#009bc2]" : "text-slate-500 hover:bg-slate-100" }`}
                      >
                        {p}
                      </button>
                    </PaginationItem>
                  </React.Fragment>
                )
              })}

            <PaginationItem>
              <button
                type="button"
                onClick={() => {
                  const newPage = Math.min(totalPages || 1, (page || 1) + 1)
                  onPageChange(newPage)
                }}
                disabled={(page || 1) >= (totalPages || 1)}
                className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CaretRightIcon className="size-4" />
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}