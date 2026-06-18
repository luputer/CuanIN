import React from "react";

export function CardContainer({
  children,
  className,
  shadow = true,
}: {
  children: React.ReactNode;
  className?: string;
  shadow?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-300 bg-white p-6 ${shadow ? "shadow-[0_-4px_0px_0px_rgba(0,146,184,100)]" : ""} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
