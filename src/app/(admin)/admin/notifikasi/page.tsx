"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { BellIcon, CheckIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DetailHeader } from "~/components/shared/detail-header";
import { Skeleton } from "~/components/ui/skeleton";
import { useDataTable } from "~/hooks/shared/use-data-table";
import { TablePagination } from "~/components/ui/table";

function formatTimeAgo(date: Date | string) {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return format(d, "d MMM yyyy", { locale: id });
}

export default function AdminNotifikasiPage() {
  const { page, setPage, limit, setLimit } = useDataTable<"createdAt">("createdAt", "desc");

  const { data, isLoading, refetch } = api.notification.list.useQuery({
    page: page || 1,
    limit: limit || 20,
  });
  const markReadMutation = api.notification.markRead.useMutation({
    onSuccess: () => refetch(),
  });
  const markAllReadMutation = api.notification.markAllRead.useMutation({
    onSuccess: () => refetch(),
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const notifications = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="space-y-6">
        <DetailHeader
          backLink="/admin/dashboard"
          backLabel="Kembali ke Dashboard"
          title="Notifikasi"
          actions={
            unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckIcon size={14} weight="bold" />
                Tandai Semua Dibaca
              </button>
            ) : undefined
          }
        />

        <div className="flex-1 min-w-0 bg-white rounded-xl border border-slate-800 overflow-hidden w-full">
          <div className="px-4 py-6 sm:px-8 sm:py-8">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
                    <Skeleton className="mb-2 h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <BellIcon size={48} className="mb-3 text-slate-300" />
                <p className="text-base font-medium text-slate-500">Tidak ada notifikasi</p>
                <p className="mt-1 text-sm text-slate-400">Notifikasi akan muncul di sini</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => {
                  const isExpanded = expandedId === notif.id;
                  return (
                    <div
                      key={notif.id}
                      className={`rounded-xl border border-slate-200  shadow-sm bg-white transition-colors ${!notif.isRead ? "border-cuan-cyan/30 bg-cuan-cyan/[0.03]" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : notif.id)}
                        className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {!notif.isRead && (
                              <span className="inline-block size-2 shrink-0 rounded-full bg-cuan-cyan" />
                            )}
                            <span className={`text-sm font-semibold leading-snug ${!notif.isRead ? "text-slate-800" : "text-slate-600"}`}>
                              {notif.title}
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed ${isExpanded ? "" : "line-clamp-2"} ${!notif.isRead ? "text-slate-600" : "text-slate-500"}`}>
                            {notif.message}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <span className="whitespace-nowrap text-[11px] text-slate-400">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                      </button>

                      {!notif.isRead && (
                        <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-2">
                          <button
                            type="button"
                            onClick={() => markReadMutation.mutate({ id: notif.id })}
                            className="flex items-center gap-1 text-xs font-medium text-cuan-blue hover:underline cursor-pointer"
                          >
                            <CheckIcon size={12} weight="bold" />
                            Tandai Dibaca
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {total > limit && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <TablePagination
              page={page}
              totalPages={totalPages}
              limit={limit}
              total={total}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          </div>
        )}
      </div>
    </div>
  );
}
