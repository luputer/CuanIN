"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { productDigitalSchema } from "~/lib/validation";
import type { z } from "zod";
import { useImageUpload } from "./use-upload";

export type DigitalProductFormValues = z.infer<typeof productDigitalSchema>;

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
        resolver: zodResolver(productDigitalSchema),
        defaultValues: {
            priceType: "free",
            status: "published",
            price: 0,
            benefit: isEdit ? [] : ["", "", ""],
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
            reset({
                name: product.name,
                shortDescription: product.shortDescription ?? "",
                description: product.description ?? "",
                priceType: priceVal === 0 ? "free" : "paid",
                price: priceVal,
                link: product.link ?? "",
                format: product.format ?? undefined,
                status: product.status ?? "published",
                notes: "",
                image: product.image ?? undefined,
                benefit: (product.benefit as string[]) ?? [],
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
        if (isEdit && id) {
            updateMutation.mutate({
                id,
                name: data.name,
                shortDescription: data.shortDescription,
                description: data.description,
                price: data.priceType === "free" ? 0 : (data.price ?? 0),
                link: data.link,
                format: data.format,
                status: data.status,
                image: data.image,
                benefit: data.benefit?.filter((b) => b.trim() !== ""),
            });
        } else {
            createMutation.mutate({
                name: data.name,
                description: data.description,
                price: data.priceType === "free" ? 0 : (data.price ?? 0),
                type: "DIGITAL_PRODUCT",
                link: data.link,
                format: data.format,
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
        isPending: createMutation.isPending || updateMutation.isPending,
        isLoadingProduct,
        product,
    };
}
