"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useImageUpload } from "./use-upload";
import { productDigitalSchema, type DigitalProductFormValues } from "../lib/validation";

interface UseProductDigitalProps {
    id?: string;
    isEdit?: boolean;
}

export function useProductDigital({ id, isEdit = false }: UseProductDigitalProps = {}) {
    const router = useRouter();
    const utils = api.useUtils();

    // Query for edit mode
    const { data: product, isLoading: isLoadingProduct } = api.products.getById.useQuery(
        { id: id! },
        { enabled: !!id && isEdit }
    );

    const form = useForm<DigitalProductFormValues>({
        resolver: zodResolver(productDigitalSchema) as any,
        defaultValues: {
            priceType: "free",
            status: "published",
            price: 0,
            benefit: isEdit ? [] : [""],
            platform: "zoom",
            platformCustom: "",
            quota: 0,
            enableQuota: false,
            enableNotes: false,
            notes: "",
            enableVoucher: true,
            vouchers: [],
            enableDiscount: false,
            discountPrice: 0,
        },
    });

    const { control, reset, setValue, handleSubmit } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "benefit" as never,
    });

    const { uploading, previewUrl, handleFileUpload, setPreviewUrl } = useImageUpload("products");

    // Pre-fill form when data loads (Edit mode)
    useEffect(() => {
        if (product && isEdit) {
            const priceVal = Number(product.price);
            const discVal = Number(product.discountPrice ?? 0);
            reset({
                name: product.name,
                shortDescription: product.shortDescription ?? "",
                description: product.description ?? "",
                priceType: priceVal === 0 ? "free" : "paid",
                price: priceVal,
                link: product.link ?? "",
                format: product.format ?? undefined,
                platform: product.platform ?? "zoom",
                platformCustom: "",
                duration: product.duration ?? undefined,
                status: product.status ?? "published",
                notes: product.notes ?? "",
                enableNotes: !!product.notes,
                image: product.image ?? undefined,
                benefit: (product.benefit as string[]) ?? [],
                quota: product.quota ?? 0,
                enableQuota: (product.quota ?? 0) > 0,
                vouchers: product.vouchers?.map((v) => v.id) ?? [],
                enableVoucher: true,
                enableDiscount: discVal > 0,
                discountPrice: discVal,
            });
            if (product.image) setPreviewUrl(product.image);
        }
    }, [product, reset, isEdit, setPreviewUrl]);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await handleFileUpload(e);
        if (url) setValue("image", url, { shouldValidate: true });
    };

    const createMutation = api.products.create.useMutation({
        onSuccess: () => {
            void utils.products.getAll.invalidate();
            toast.success("Produk Digital berhasil dibuat");
            router.push("/produk-digital");
        },
        onError: (error) => {
            toast.error(`Gagal membuat produk digital: ${error.message}`);
        },
    });

    const updateMutation = api.products.update.useMutation({
        onSuccess: () => {
            if (id) void utils.products.getById.invalidate({ id });
            void utils.products.getAll.invalidate();
            toast.success("Produk Digital berhasil diperbarui");
            router.push(`/produk-digital/${id}`);
        },
        onError: (error) => {
            toast.error(`Gagal memperbarui produk: ${error.message}`);
        },
    });

    const onSubmit = handleSubmit((data) => {
        const actualPlatform = data.platform === "other" ? data.platformCustom : data.platform;
        if (isEdit && id) {
            updateMutation.mutate({
                id,
                name: data.name,
                shortDescription: data.shortDescription,
                description: data.description,
                price: data.price ?? 0,
                link: data.link,
                format: data.format,
                platform: actualPlatform,
                duration: data.duration,
                status: data.status,
                image: data.image,
                benefit: data.benefit?.filter((b) => b.trim() !== ""),
                quota: data.enableQuota ? data.quota : 0,
                notes: data.enableNotes ? data.notes : undefined,
                vouchers: data.enableVoucher ? data.vouchers : [],
                discountPrice: data.enableDiscount ? data.discountPrice : undefined,
            });
        } else {
            createMutation.mutate({
                name: data.name,
                description: data.description,
                price: data.price ?? 0,
                type: "DIGITAL_PRODUCT",
                link: data.link,
                format: data.format,
                platform: actualPlatform,
                duration: data.duration,
                image: data.image,
                benefit: data.benefit?.filter((b) => b.trim() !== ""),
                quota: data.enableQuota ? data.quota : 0,
                notes: data.enableNotes ? data.notes : undefined,
                vouchers: data.enableVoucher ? data.vouchers : [],
                discountPrice: data.enableDiscount ? data.discountPrice : undefined,
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
        isPending: createMutation.isPending || updateMutation.isPending,
        isLoadingProduct,
        product,
    };
}
