import type { Metadata } from "next";
import { VoucherClient } from "./voucher-client";

export const metadata: Metadata = {
    title: "Voucher - CuanIN",
    description: "Kelola seluruh voucher diskon Anda di sini.",
};

export default function VoucherPage() {
    return <VoucherClient />;
}
