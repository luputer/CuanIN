import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { voucherSchema } from "~/lib/validation";
import type { z } from "zod";

export type VoucherFormValues = z.infer<typeof voucherSchema>;

interface UseEditVoucherProps {
    id: string;
}

export function useEditVoucher({ id }: UseEditVoucherProps) {
    const router = useRouter();
    const utils = api.useUtils();

    const { data: voucher, isLoading } = api.vouchers.getById.useQuery(
        { id },
        { enabled: !!id }
    );

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
        },
    });

    const { reset } = form;

    useEffect(() => {
        if (voucher) {
            reset({
                name: voucher.name ?? "",
                code: voucher.code,
                type: voucher.type as "PERSEN" | "NOMINAL",
                discount: Number(voucher.discount),
                startDate: new Date(voucher.startDate),
                endDate: new Date(voucher.endDate),
                status: voucher.status as "aktif" | "nonaktif" | "expired",
                usageType: voucher.usageType as "ALL_PRODUCTS" | "SELECTED_PRODUCTS",
                usageLimit: voucher.usageLimit ?? undefined,
                isLimitPerUser: voucher.isLimitPerUser ?? false,
                productIds: (voucher.products as any[])?.map((p: any) => p.id) ?? [],
            });
        }
    }, [voucher, reset]);

    const updateMutation = api.vouchers.update.useMutation({
        onSuccess: () => {
            toast.success("Voucher berhasil diperbarui");
            void utils.vouchers.getById.invalidate({ id });
            void utils.vouchers.getAll.invalidate();
        },
        onError: (error) => {
            toast.error(error.message || "Gagal memperbarui voucher");
        },
    });

    const deleteMutation = api.vouchers.delete.useMutation({
        onSuccess: () => {
            toast.success("Voucher berhasil dihapus");
            void utils.vouchers.getAll.invalidate();
            router.push("/voucher");
        },
        onError: (error) => {
            toast.error(error.message || "Gagal menghapus voucher");
        },
    });

    const onSubmit = (data: VoucherFormValues) => {
        updateMutation.mutate({
            id,
            ...data,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
            usageLimit: data.usageLimit ?? null,
        });
    };

    const handleDelete = () => {
        deleteMutation.mutate({ id });
    };

    return {
        form,
        voucher,
        isLoading,
        isPending: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isDirty: form.formState.isDirty,
        onSubmit: form.handleSubmit(onSubmit),
        handleDelete,
    };
}
