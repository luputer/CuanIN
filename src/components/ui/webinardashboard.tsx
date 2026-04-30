"use client";

import React from "react";
import {
  SquaresFourIcon,
  VideoCameraIcon,
  BookOpenIcon,
  CloudArrowUpIcon,
  UsersIcon,
  CreditCardIcon,
  StorefrontIcon,
  CopyIcon,
  EyeIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import HeaderKreator from "~/components/layout/headerkreator";
import ActionButton from "~/components/ui/button-add";
import SearchInput from "~/components/ui/search";
import ButtonFilter from "~/components/ui/filter";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TablePagination,
} from "~/components/ui/table";

const noop = () => undefined;

/* ───────── SIDEBAR ITEM (SAMA PERSIS PUNYAMU) ───────── */
function SidebarItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-2 transition-all duration-300 ease-out ${
        active
          ? "border border-slate-800 bg-yellow-200 text-base font-semibold text-slate-800 shadow-[1px_2px_0px_rgba(30,27,75)] transition duration-200 ease-out hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          : "text-base font-semibold text-slate-800 hover:bg-slate-200"
      }`}
    >
      {React.cloneElement(icon, {
        className: "w-5 h-5 shrink-0 text-slate-800",
      })}
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}

/* ───────── PREVIEW ───────── */
export default function DashboardPreview() {
  return (
    <div className="flex w-full overflow-hidden rounded-xl border-2 border-slate-800 bg-white pb-4 pl-2 shadow-[0px_3px_0px_rgba(30,27,75)] lg:h-160">
      {/* ───────── SIDEBAR (FIXED 1:1) ───────── */}
      <div className="flex w-52 flex-col border-r border-slate-800 bg-white p-4">
        <div className="mb-6 pt-2 text-2xl font-bold text-yellow-500">
          CuanIN
        </div>

        <div className="mb-3 text-xs font-bold tracking-wider text-slate-500">
          MENU
        </div>

        <div className="flex flex-col gap-2">
          <SidebarItem
            icon={<SquaresFourIcon weight="fill" />}
            label="Dashboard"
          />
          <SidebarItem
            icon={<VideoCameraIcon weight="fill" />}
            label="Webinar"
            active
          />
          <SidebarItem icon={<BookOpenIcon weight="fill" />} label="Kelas" />
          <SidebarItem
            icon={<CloudArrowUpIcon weight="fill" />}
            label="Produk Digital"
          />
          <SidebarItem icon={<UsersIcon weight="fill" />} label="User" />
          <SidebarItem
            icon={<CreditCardIcon weight="fill" />}
            label="Transaksi"
          />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg border border-cyan-600 px-4 py-2 text-sm font-semibold text-cyan-600 shadow-[0px_2px_0px_rgba(0,146,184)] transition hover:bg-cyan-50">
          <StorefrontIcon weight="fill" />
          Katalog Saya
        </div>
      </div>

      {/* ───────── MAIN ───────── */}
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        <HeaderKreator />

        {/* TITLE (dipadatkan) */}
        <div className="px-6 pt-3">
          <div className="text-xl font-semibold text-cyan-600">Webinar</div>
          <div className="text-xs text-slate-600">
            Pantau dan kelola webinar kamu.
          </div>
        </div>

        {/* TOOLBAR (dipadatkan) */}
        <div className="flex items-center justify-between gap-3 px-6 py-3">
          <SearchInput
            placeholder="Cari webinar..."
            value={""}
            onChange={noop}
            className="w-60"
          />

          <div className="flex gap-2">
            <ButtonFilter label="Tipe: Semua" />
            <ButtonFilter label="Status: Semua" />
            <ActionButton label="Tambah Webinar" />
          </div>
        </div>

        {/* TABLE WRAPPER BIAR FIT */}
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden px-6">
          <div className="h-full overflow-hidden rounded-lg">
            <Table
              className="w-full table-fixed"
              pagination={
                <div className="pointer-events-none opacity-70">
                  <TablePagination
                    page={1}
                    totalPages={3}
                    limit={10}
                    total={30}
                    onPageChange={noop}
                    onLimitChange={noop}
                  />
                </div>
              }
            >
              <TableHeader>
                <TableRow className="h-14">
                  <TableHead className="w-10 truncate text-xs">No</TableHead>
                  <TableHead className="w-26 truncate text-xs">Nama</TableHead>
                  <TableHead className="w-32 truncate text-xs">
                    Thumbnail
                  </TableHead>
                  <TableHead className="truncate text-xs">Waktu</TableHead>
                  <TableHead className="truncate text-xs">Tipe</TableHead>
                  <TableHead className="truncate text-xs">Harga</TableHead>
                  <TableHead className="w-26 truncate text-xs">
                    Pembeli
                  </TableHead>
                  <TableHead className="truncate text-xs">Status</TableHead>
                  <TableHead className="truncate text-xs">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {[
                  "Webinar Bisnis Online",
                  "UI/UX Masterclass",
                  "Digital Marketing 101",
                ].map((name, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-2 text-xs">{i + 1}</TableCell>
                    <TableCell className="truncate py-2 text-xs">
                      {name}
                    </TableCell>

                    <TableCell className="py-2">
                      <div className="h-8 w-8 rounded-md bg-slate-200" />
                    </TableCell>

                    <TableCell className="text-xs">12 Mei 2026 19:00</TableCell>
                    <TableCell className="text-xs">Webinar</TableCell>
                    <TableCell className="text-xs">Rp 50.000</TableCell>
                    <TableCell className="text-xs">24</TableCell>

                    <TableCell>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                        Published
                      </span>
                    </TableCell>

                    <TableCell className="pr-1">
                      <div className="flex items-center gap-1">
                        <button className="text-cyan-600">
                          <EyeIcon size={16} />
                        </button>

                        <button className="text-yellow-500">
                          <CopyIcon size={16} />
                        </button>

                        <button className="text-red-500">
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
