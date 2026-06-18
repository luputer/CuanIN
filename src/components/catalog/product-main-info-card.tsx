import React from "react";
import { CardContainer } from "~/components/ui/card-container";

export function ProductMainInfoCard({
  categoryLabel,
  categoryStyle,
  name,
  creatorName,
  description,
  infoItems,
}: {
  categoryLabel: string;
  categoryStyle: string;
  name: string;
  creatorName: string;
  description: string;
  infoItems: React.ReactNode[];
}) {
  return (
    <CardContainer className="md:p-8">
      <span className={`w-fit rounded-full border px-3 py-1 text-xs ${categoryStyle}`}>
        {categoryLabel}
      </span>

      <h1 className="text-2xl font-bold text-slate-800 md:text-4xl mt-4">
        {name}
      </h1>

      <div className="flex items-center gap-2 mt-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-200 text-xs font-bold">
          {creatorName?.charAt(0).toUpperCase()}
        </div>
        <p className="text-sm font-medium text-slate-700">{creatorName}</p>
      </div>

      <p className="text-sm text-slate-600 mt-4 break-words whitespace-pre-wrap">{description}</p>

      {infoItems.length > 0 && (
        <div className="flex flex-wrap gap-6 py-4 text-sm text-slate-700">
          {infoItems}
        </div>
      )}
    </CardContainer>
  );
}
