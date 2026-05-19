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
            status: "published",
            price: 0,
            benefit: isEdit ? [] : [""],
            contentType: "",
            platformCustom: "",
            duration: "",
            capacity: 0,
            enableQuota: false,
            enableNotes: false,
            notes: "",
            enableVoucher: true,
            vouchers: [],
            enableDiscount: false,
            discountPrice: 0,
            image: "",
            images: [],
        },
    });

    const { control, reset, setValue, handleSubmit } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "benefit" as never,
    });

    const { uploading, handleFileUpload } = useImageUpload("products");

    // Pre-fill form when data loads (Edit mode)
    useEffect(() => {
        if (product && isEdit) {
            const priceVal = Number(product.price);
            const discVal = Number(product.discountPrice ?? 0);
            const isStandardFormat = ["PDF", "Video", "Template", "E-book", "ZIP"].includes(product.contentType ?? "");
            reset({
                name: product.name,
                shortDescription: product.shortDescription ?? "",
                description: product.description ?? "",
                price: priceVal,
                link: product.link ?? "",
                contentType: isStandardFormat ? (product.contentType ?? "") : "other",
                platformCustom: isStandardFormat ? "" : (product.contentType ?? ""),
                duration: product.duration ?? undefined,
                status: product.status ?? "published",
                notes: product.notes ?? "",
                enableNotes: !!product.notes,
                image: product.image ?? undefined,
                images: (product.images as string[]) ?? [],
                benefit: (product.benefit as string[]) ?? [],
                capacity: product.capacity ?? 0,
                enableQuota: (product.capacity ?? 0) > 0,
                vouchers: product.vouchers?.map((v) => v.id) ?? [],
                enableVoucher: true,
                enableDiscount: discVal > 0,
                discountPrice: discVal,
            });
        }
    }, [product, reset, isEdit]);

    const onFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await handleFileUpload(e);
        if (url) {
            const currentImages = form.getValues("images") || [];
            if (currentImages.length < 4) {
                const newImages = [...currentImages, url];
                setValue("images", newImages, { shouldValidate: true, shouldDirty: true });
                // Main image is the first one if not set
                if (!form.getValues("image")) {
                    setValue("image", url, { shouldValidate: true, shouldDirty: true });
                }
            } else {
                toast.error("Maksimal 4 gambar");
            }
        }
        e.target.value = "";
    };

    const removeImage = (index: number) => {
        const currentImages = form.getValues("images") || [];
        const newImages = currentImages.filter((_, i) => i !== index);
        setValue("images", newImages, { shouldValidate: true, shouldDirty: true });
        // Update main image if we removed it
        if (form.getValues("image") === currentImages[index]) {
            setValue("image", newImages[0] || "", { shouldValidate: true, shouldDirty: true });
        }
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
        const actualContentType = data.contentType === "other" ? data.platformCustom : data.contentType;
        if (isEdit && id) {
            updateMutation.mutate({
                id,
                name: data.name,
                shortDescription: data.shortDescription,
                description: data.description,
                price: data.price ?? 0,
                link: data.link,
                contentType: actualContentType,
                duration: data.duration,
                status: data.status,
                image: data.image,
                images: data.images,
                benefit: data.benefit?.filter((b) => b.trim() !== ""),
                capacity: data.enableQuota ? data.capacity : 0,
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
                contentType: actualContentType,
                duration: data.duration,
                image: data.image,
                images: data.images,
                benefit: data.benefit?.filter((b) => b.trim() !== ""),
                capacity: data.enableQuota ? data.capacity : 0,
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
        onFilesChange,
        removeImage,
        onSubmit,
        isPending: createMutation.isPending || updateMutation.isPending,
        isLoadingProduct,
        product,
    };
}
