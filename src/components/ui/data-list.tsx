import React from "react";

export function DataList({
  items,
}: {
  items: { label: string; value: string | React.ReactNode }[];
}) {
  return (
    <div className="space-y-4 border-t border-slate-200 pt-4 text-sm">
      {items.map((item, idx) => (
        <div key={idx} className="grid grid-cols-3 gap-2">
          <span className="text-slate-500">{item.label}</span>
          <span className="col-span-2 font-medium text-slate-800 break-all">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
