"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useImageUpload } from "./use-upload";
import { webinarSchema } from "~/lib/validation";
import type { z } from "zod";

type WebinarFormValues = z.infer<typeof webinarSchema>;

interface UseWebinarProps {
    id?: string;
    isEdit?: boolean;
}

export function useWebinar({ id, isEdit = false }: UseWebinarProps = {}) {
    const router = useRouter();
    const utils = api.useUtils();

    // Query — hanya aktif di mode edit
    const { data: product, isLoading: isLoadingProduct } = api.products.getById.useQuery(
        { id: id! },
        { enabled: !!id && isEdit }
    );

    const form = useForm<WebinarFormValues>({
        resolver: zodResolver(webinarSchema),
        defaultValues: {
            priceType: "free",
            platform: "zoom",
            status: "unpublished",
            price: 0,
            quota: 0,
            notes: "",
            benefit: isEdit ? [] : ["", "", ""],
        },
    });

    const { control, reset, setValue, handleSubmit } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "benefit" as never,
    });

    const { uploading, previewUrl, handleFileUpload, setPreviewUrl } = useImageUpload("products");

    // Pre-fill form saat data selesai di-load (mode edit)
    useEffect(() => {
        if (product && isEdit) {
            const priceVal = Number(product.price);
            reset({
                name: product.name,
                shortDescription: product.shortDescription ?? "",
                description: product.description ?? "",
                priceType: priceVal === 0 ? "free" : "paid",
                price: priceVal,
                platform: product.platform ?? "zoom",
                link: product.link ?? "",
                notes: product.notes ?? "",
                status: product.status ?? "unpublished",
                quota: product.quota ?? 0,
                dateStart: product.startDate ?? undefined,
                dateEnd: product.endDate ?? undefined,
                dateDeadline: product.dateDeadline ?? undefined,
                benefit: (product.benefit as string[]) ?? [],
            });
            if (product.image) setPreviewUrl(product.image);
        }
    }, [product, reset, isEdit, setPreviewUrl]);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await handleFileUpload(e);
        if (url) setValue("image", url, { shouldValidate: true });
    };

    const updateMutation = api.products.update.useMutation({
        onSuccess: () => {
            if (id) void utils.products.getById.invalidate({ id });
            void utils.products.getAll.invalidate();
            toast.success("Webinar berhasil diperbarui");
            router.push(`/webinar/${id}`);
        },
        onError: (error) => {
            toast.error(`Gagal memperbarui webinar: ${error.message}`);
        },
    });

    const onSubmit = handleSubmit((data) => {
        if (isEdit && id) {
            const actualPlatform = data.platform === "other" ? data.platformCustom : data.platform;
            updateMutation.mutate({
                id,
                name: data.name,
                shortDescription: data.shortDescription,
                description: data.description,
                price: data.priceType === "free" ? 0 : (data.price ?? 0),
                platform: actualPlatform,
                link: data.link ?? undefined,
                notes: data.notes ?? undefined,
                status: data.status,
                startDate: data.dateStart,
                endDate: data.dateEnd,
                dateDeadline: data.dateDeadline,
                quota: data.quota,
                image: data.image,
                benefit: data.benefit?.filter((b) => b.trim() !== ""),
            });
        }
    });

    return {
        form,
        fields,
        append,
        remove,
        uploading,
        previewUrl,
        onFileChange,
        onSubmit,
        isPending: updateMutation.isPending,
        isLoadingProduct,
        product,
    };
}
