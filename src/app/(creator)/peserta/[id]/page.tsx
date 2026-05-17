"use client";

// React
import { useParams } from "next/navigation";

// Next.js
import Link from "next/link";

// Third-party
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// Icons
import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  PhoneIcon,
  EnvelopeSimpleIcon,
  UserIcon,
} from "@phosphor-icons/react";

// Internal & Utils
import { api } from "~/trpc/react";

// Components
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { FormGroup, SectionHeader } from "~/components/ui/form-layout";
import { TooltipProvider } from "~/components/ui/tooltip";

export default function ParticipantDetailPage() {
  // ─── States & Hooks ──────────────────────────────────────────────────────

  const params = useParams();
  const email = params.id ? decodeURIComponent(params.id as string) : "";

  // ─── API ─────────────────────────────────────────────────────────────────

  const { data, isLoading } = api.purchases.getParticipantDetail.useQuery(
    { email },
    { enabled: !!email },
  );

  const participant = data?.participant;
  const purchases = data?.purchases ?? [];

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "completed":
        return "Berhasil";
      case "pending":
        return "Pending";
      case "failed":
        return "Gagal";
      default:
        return status;
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-50">
          <div className="sticky top-[74px] z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-2 bg-slate-50">
            <Link
              href="/peserta"
              className="group font-regular mb-2 flex w-fit items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-800"
            >
              <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="leading-none">Kembali ke Daftar User</span>
            </Link>
            <div className="mb-2 text-2xl font-semibold text-slate-800">
              {isLoading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                participant?.name
              )}
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-cyan-50">
          <div className="px-4 py-6 sm:px-10 sm:py-8">
            <SectionHeader title="Informasi User" />

            <div className="mt-4">
              <FormGroup label="Nama Lengkap" className="py-1.5 md:py-2 gap-1 md:gap-4" labelWidth="md:w-[140px]">
                <div className="flex h-[52px] items-center gap-3 rounded-lg border border-slate-400 bg-white px-4 font-regular text-slate-800">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  {isLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    participant?.name
                  )}
                </div>
              </FormGroup>

              <FormGroup label="Email" className="py-1.5 md:py-2 gap-1 md:gap-4" labelWidth="md:w-[140px]">
                <div className="flex h-[52px] items-center gap-3 rounded-lg border border-slate-400 bg-white px-4 font-regular text-slate-800">
                  <EnvelopeSimpleIcon className="h-4 w-4 text-slate-400" />
                  {isLoading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : (
                    participant?.email
                  )}
                </div>
              </FormGroup>

              <FormGroup label="Nomor WhatsApp" className="py-1.5 md:py-2 gap-1 md:gap-4" labelWidth="md:w-[140px]">
                <div className="flex h-[52px] items-center gap-3 rounded-lg border border-slate-400 bg-white px-4 font-regular text-slate-800">
                  <PhoneIcon className="h-4 w-4 text-slate-400" />
                  {isLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    (participant?.phone ?? "-")
                  )}
                </div>
              </FormGroup>
            </div>
          </div>
        </div>

        {/* Purchase History */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <CalendarBlankIcon
              className="h-5 w-5 text-cyan-600"
              weight="bold"
            />
            <h3 className="text-lg font-semibold text-slate-800">
              Riwayat Pembelian
            </h3>
          </div>

          {/* Desktop/Tablet Table */}
          <div className="hidden sm:block w-full pb-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[5%] text-center whitespace-nowrap">No</TableHead>
                  <TableHead className="w-[30%] whitespace-nowrap">Produk</TableHead>
                  <TableHead className="w-[15%] whitespace-nowrap">Kategori</TableHead>
                  <TableHead className="w-[15%] whitespace-nowrap">Tanggal Beli</TableHead>
                  <TableHead className="w-[15%] whitespace-nowrap">Harga</TableHead>
                  <TableHead className="w-[20%] whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow data-type="body" key={i}>
                      <TableCell>
                        <Skeleton className="mx-auto h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : purchases.length === 0 ? (
                  <TableRow className="text-center">
                    <TableCell colSpan={6} className="py-20">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-slate-500">
                          Tidak ada riwayat pembelian.
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map((item, index) => (
                    <TableRow key={item.id} data-type="body">
                      <TableCell className="text-center font-medium">
                        {index + 1}
                      </TableCell>

                      <TableCell className="font-medium whitespace-nowrap text-slate-800">
                        <div className="flex min-h-[48px] items-center">
                          {item.product.name}
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-slate-600">
                        <div className="flex min-h-[48px] items-center">
                          {item.product.type === "WEBINAR"
                            ? "Webinar"
                            : item.product.type === "KELAS_ONLINE"
                              ? "Kelas Online"
                              : "Produk Digital"}
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-slate-600">
                        <div className="flex min-h-[48px] items-center">
                          {format(new Date(item.createdAt), "d MMM yyyy", {
                            locale: idLocale,
                          })}
                        </div>
                      </TableCell>

                      <TableCell className="font-medium whitespace-nowrap text-slate-800">
                        <div className="flex min-h-[48px] items-center">
                          Rp {Number(item.amount).toLocaleString("id-ID")}
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <div className="flex min-h-[48px] items-center">
                          <span
                            className={`rounded-full px-4 py-1 text-[13px] leading-tight font-medium ${getStatusColor(item.status)}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards (Only visible on mobile) */}
          <div className="space-y-4 sm:hidden">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3 animate-pulse">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))
            ) : purchases.length === 0 ? (
              <div className="text-center py-8 bg-white border border-slate-800 rounded-xl p-4 text-slate-500">
                Tidak ada riwayat pembelian.
              </div>
            ) : (
              purchases.map((item, index) => (
                <div key={item.id} className="bg-white border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-xs font-semibold text-slate-400"># {index + 1}</span>
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-medium ${getStatusColor(item.status)}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 break-words leading-normal">
                      {item.product.name}
                    </div>

                    <div className="text-xs text-slate-500">
                      <span className="font-medium text-slate-400">Kategori: </span>
                      {item.product.type === "WEBINAR"
                        ? "Webinar"
                        : item.product.type === "KELAS_ONLINE"
                          ? "Kelas Online"
                          : "Produk Digital"}
                    </div>

                    <div className="text-xs text-slate-500">
                      <span className="font-medium text-slate-400">Tanggal Beli: </span>
                      {format(new Date(item.createdAt), "d MMM yyyy", {
                        locale: idLocale,
                      })}
                    </div>

                    <div className="text-xs pt-1">
                      <span className="font-medium text-slate-400">Harga: </span>
                      <span className="font-semibold text-slate-700">
                        Rp {Number(item.amount).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
