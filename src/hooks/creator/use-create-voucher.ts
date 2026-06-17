import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { voucherSchema } from "~/lib/validation";
import type { z } from "zod";

export type VoucherFormValues = z.infer<typeof voucherSchema>;

export function useCreateVoucher() {
    const router = useRouter();
    const utils = api.useUtils();

    const form = useForm<VoucherFormValues>({
        resolver: zodResolver(voucherSchema),
        defaultValues: {
            name: "",
            code: "",
            type: "PERSEN",
            discount: 0,
            status: "aktif",
            usageType: "ALL_PRODUCTS",
            isLimitPerUser: false,
            productIds: [],
            startDate: new Date(),
            endDate: new Date(),
        },
    });

    const createMutation = api.vouchers.create.useMutation({
        onSuccess: () => {
            toast.success("Voucher berhasil dibuat");
            void utils.vouchers.getAll.invalidate();
            router.push("/voucher");
        },
        onError: (error) => {
            toast.error(error.message || "Gagal membuat voucher");
        },
    });

    const onSubmit = (data: VoucherFormValues) => {
        createMutation.mutate({
            ...data,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
            usageLimit: data.usageLimit ?? null,
        });
    };

    return {
        form,
        router,
        isPending: createMutation.isPending,
        onSubmit: form.handleSubmit(onSubmit),
    };
}
