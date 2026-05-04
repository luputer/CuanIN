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
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-slate-50">
          <div className="sticky top-[74px] z-40 -mx-4 mb-2 bg-slate-50 px-4">
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
              <FormGroup label="Nama Lengkap">
                <div className="flex h-[52px] items-center gap-3 rounded-lg border border-slate-400 bg-white px-4 font-medium text-slate-800">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  {isLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    participant?.name
                  )}
                </div>
              </FormGroup>

              <FormGroup label="Email">
                <div className="flex h-[52px] items-center gap-3 rounded-lg border border-slate-400 bg-white px-4 font-medium text-slate-800">
                  <EnvelopeSimpleIcon className="h-4 w-4 text-slate-400" />
                  {isLoading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : (
                    participant?.email
                  )}
                </div>
              </FormGroup>

              <FormGroup label="Nomor WhatsApp">
                <div className="flex h-[52px] items-center gap-3 rounded-lg border border-slate-400 bg-white px-4 font-medium text-slate-800">
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[5%] text-center">No</TableHead>
                <TableHead className="w-[30%]">Produk</TableHead>
                <TableHead className="w-[15%]">Kategori</TableHead>
                <TableHead className="w-[15%]">Tanggal Beli</TableHead>
                <TableHead className="w-[15%]">Harga</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
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
      </div>
    </TooltipProvider>
  );
}
