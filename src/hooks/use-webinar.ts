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
        resolver: zodResolver(webinarSchema) as any,
        defaultValues: {
            contentType: "zoom",
            status: "unpublished",
            price: 0,
            capacity: 0,
            notes: "",
            benefit: isEdit ? [] : ["", "", ""],
            enableVoucher: true,
            vouchers: [],
            enableNotes: false,
            enableDiscount: false,
            discountPrice: 0,
            image: "",
            images: [],
        },
    });

    const { control, reset, setValue, getValues, watch, handleSubmit } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "benefit" as never,
    });

    const { uploading, previewUrl, handleFileUpload, setPreviewUrl } = useImageUpload("products");

    // Pre-fill form saat data selesai di-load (mode edit)
    useEffect(() => {
        if (product && isEdit) {
            const priceVal = Number(product.price);
            const isStandardPlatform = ["zoom", "google-meet"].includes(product.contentType ?? "");
            reset({
                name: product.name,
                shortDescription: product.shortDescription ?? "",
                description: product.description ?? "",
                price: priceVal,
                contentType: isStandardPlatform ? (product.contentType ?? "zoom") : "other",
                platformCustom: isStandardPlatform ? "" : (product.contentType ?? ""),
                link: product.link ?? "",
                notes: product.notes ?? "",
                status: product.status ?? "unpublished",
                capacity: product.capacity ?? 0,
                dateStart: product.startDate ?? undefined,
                dateEnd: product.endDate ?? undefined,
                dateDeadline: product.dateDeadline ?? undefined,
                benefit: (product.benefit as string[]) ?? [],
                images: (product.images as string[]) ?? [],
                vouchers: (product.vouchers as any[])?.map((v: any) => v.id) ?? [],
                discountPrice: Number(product.discountPrice) || 0,
                enableVoucher: true,
                enableNotes: !!product.notes,
                enableDiscount: Number(product.discountPrice) > 0,
                enableQuota: (product.capacity ?? 0) > 0,
                image: product.image ?? "",
            });
            if (product.image) setPreviewUrl(product.image);
        }
    }, [product, reset, isEdit, setPreviewUrl]);

    const images = watch("images") || [];

    const onFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await handleFileUpload(e);
        if (url) {
            const currentImages = getValues("images") || [];
            if (currentImages.length < 4) {
                const newImages = [...currentImages, url];
                setValue("images", newImages, { shouldValidate: true, shouldDirty: true });
                // Main image is the first one if not set
                if (!getValues("image")) {
                    setValue("image", url, { shouldValidate: true, shouldDirty: true });
                }
            } else {
                toast.error("Maksimal 4 gambar");
            }
        }
        e.target.value = "";
    };

    const handlePriceAdjust = (step: number) => {
        const currentPrice = getValues("price") || 0;
        setValue("price", Math.max(0, currentPrice + step), { shouldValidate: true, shouldDirty: true });
    };

    const handleDiscountPriceAdjust = (step: number) => {
        const currentPrice = getValues("discountPrice") || 0;
        setValue("discountPrice", Math.max(0, currentPrice + step), { shouldValidate: true, shouldDirty: true });
    };

    const handleQuotaAdjust = (step: number) => {
        const currentQuota = getValues("capacity") || 0;
        setValue("capacity", Math.max(0, currentQuota + step), { shouldValidate: true, shouldDirty: true });
    };

    const removeImage = (index: number) => {
        const currentImages = getValues("images") || [];
        const newImages = currentImages.filter((_, i) => i !== index);
        setValue("images", newImages, { shouldValidate: true, shouldDirty: true });
        // Update main image if we removed it
        if (getValues("image") === currentImages[index]) {
            setValue("image", newImages[0] || "", { shouldValidate: true, shouldDirty: true });
        }
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await handleFileUpload(e);
        if (url) {
            setValue("image", url, { shouldValidate: true, shouldDirty: true });
        }
        e.target.value = "";
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
            const actualPlatform = data.contentType === "other" ? data.platformCustom : data.contentType;
            updateMutation.mutate({
                id,
                name: data.name,
                shortDescription: data.shortDescription,
                description: data.description,
                price: data.price ?? 0,
                contentType: actualPlatform,
                link: data.link ?? undefined,
                vouchers: data.enableVoucher ? data.vouchers : [],
                discountPrice: data.enableDiscount ? data.discountPrice : null,
                notes: data.enableNotes ? data.notes : null,
                status: data.status,
                startDate: data.dateStart,
                endDate: data.dateEnd,
                dateDeadline: data.dateDeadline,
                capacity: data.enableQuota ? data.capacity : 0,
                image: data.image,
                images: data.images,
                benefit: data.benefit?.filter((b: string) => b.trim() !== ""),
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
        onFilesChange,
        removeImage,
        handlePriceAdjust,
        handleDiscountPriceAdjust,
        handleQuotaAdjust,
        images,
        onSubmit,
        isPending: updateMutation.isPending,
        isLoadingProduct,
        product,
    };
}
