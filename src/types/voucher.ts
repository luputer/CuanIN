import { type VoucherType } from "../../prisma/generated/prisma";

export type CreatorVoucherType = {
    id: string;
    code: string;
    name: string | null;
    discount: number | string | { toNumber: () => number };
    type: VoucherType;
    status: string;
    startDate: Date;
    endDate: Date;
    usageLimit: number | null;
    usageCount: number;
};
