import React from "react";
import { CardContainer } from "~/components/ui/card-container";
import { DataList } from "~/components/ui/data-list";

interface PaymentDetailsCardProps {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
}

export function PaymentDetailsCard({
  buyerName,
  buyerEmail,
  buyerPhone,
}: PaymentDetailsCardProps) {
  return (
    <CardContainer>
      <div className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="text-lg font-semibold text-slate-700">Informasi Pelanggan</div>
          <p className="text-sm text-slate-700">
            Berikut adalah detail data diri yang digunakan untuk pembelian ini.
          </p>
        </div>
      </div>
      <DataList
        items={[
          { label: "Nama", value: buyerName },
          { label: "Email", value: buyerEmail },
          { label: "No. HP", value: buyerPhone },
        ]}
      />
    </CardContainer>
  );
}
