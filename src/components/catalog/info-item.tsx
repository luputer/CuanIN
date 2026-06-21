import React from "react";

export function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2 pr-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cuan-cyan/10 text-007EA5">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-slate-600">{label}</span>
          <span className="text-sm font-medium text-slate-700">{value}</span>
        </div>
      </div>
    </div>
  );
}
