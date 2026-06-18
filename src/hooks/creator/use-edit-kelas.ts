import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useImageUpload } from "~/hooks/shared/use-upload";
import { productKelasOnlineSchema } from "~/lib/validation";
import type { z } from "zod";

type KelasOnlineFormValues = z.infer<typeof productKelasOnlineSchema>;

const KELAS_PLATFORMS = ["zoom", "google-meet", "website"];

interface UseEditKelasProps {
    id?: string;
    isEdit?: boolean;
}

export function useEditKelas({ id, isEdit = false }: UseEditKelasProps = {}) {
    const router = useRouter();
    const utils = api.useUtils();

    const { data: product, isLoading: isLoadingProduct } = api.products.getById.useQuery(
        { id: id! },
        { enabled: !!id && isEdit }
    );

    const form = useForm<KelasOnlineFormValues>({
        resolver: zodResolver(productKelasOnlineSchema),
        defaultValues: {
            status: "published",
            price: 0,
            benefit: [],
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
            enablePortal: false,
        },
    });

    const { control, reset, setValue, handleSubmit } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "benefit" as never,
    });

    const {
        fields: linkFields,
        append: appendLink,
        remove: removeLink,
    } = useFieldArray({
        control,
        name: "links" as never,
    });

    const { uploading, handleFileUpload } = useImageUpload("products");

    useEffect(() => {
        if (product && isEdit) {
            const priceVal = Number(product.price);
            const discVal = Number(product.discountPrice ?? 0);
            const isKelasPlatform = KELAS_PLATFORMS.includes(product.contentType ?? "");
            reset({
                name: product.name,
                shortDescription: product.shortDescription ?? "",
                description: product.description ?? "",
                price: priceVal,
                link: product.link ?? "",
                contentType: isKelasPlatform ? (product.contentType ?? "") : "other",
                platformCustom: isKelasPlatform ? "" : (product.contentType ?? ""),
                duration: product.duration ?? "",
                status: product.status ?? "published",
                notes: product.notes ?? "",
                enableNotes: !!product.notes,
                image: product.image ?? undefined,
                images: (product.images as string[]) ?? [],
                benefit: (product.benefit as string[]) ?? [],
                links: ((product as any).links as string[]) ?? [],
                capacity: product.capacity ?? 0,
                enableQuota: (product.capacity ?? 0) > 0,
                vouchers: product.vouchers?.map((v) => v.id) ?? [],
                enableVoucher: true,
                enableDiscount: discVal > 0,
                discountPrice: discVal,
                enablePortal: product.portalEnabled ?? false,
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
        if (form.getValues("image") === currentImages[index]) {
            setValue("image", newImages[0] || "", { shouldValidate: true, shouldDirty: true });
        }
    };

    const updateMutation = api.products.update.useMutation({
        onSuccess: () => {
            if (id) void utils.products.getById.invalidate({ id });
            void utils.products.getAll.invalidate();
            toast.success("Kelas Online berhasil diperbarui");
            router.push(`/kelas/${id}`);
        },
        onError: (error) => {
            toast.error(`Gagal memperbarui kelas: ${error.message}`);
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
                links: data.links?.filter((l) => l.trim() !== "") ?? [],
                contentType: actualContentType,
                duration: data.duration,
                status: data.status,
                image: data.image,
                images: data.images as string[],
                benefit: data.benefit?.filter((b) => b.trim() !== ""),
                capacity: data.enableQuota ? data.capacity : 0,
                notes: data.enableNotes ? data.notes : null,
                vouchers: data.enableVoucher ? data.vouchers : [],
                discountPrice: data.enableDiscount ? data.discountPrice : undefined,
                portalEnabled: data.enablePortal,
            });
        }
    });

    const handlePriceAdjust = (step: number) => {
        const currentPrice = form.getValues("price") || 0;
        form.setValue("price", Math.max(0, currentPrice + step), { shouldValidate: true, shouldDirty: true });
    };

    const handleDiscountPriceAdjust = (step: number) => {
        const currentPrice = form.getValues("discountPrice") || 0;
        form.setValue("discountPrice", Math.max(0, currentPrice + step), { shouldValidate: true, shouldDirty: true });
    };

    const handleQuotaAdjust = (step: number) => {
        const currentQuota = form.getValues("capacity") || 0;
        form.setValue("capacity", Math.max(0, currentQuota + step), { shouldValidate: true, shouldDirty: true });
    };

    return {
        form,
        fields,
        append,
        remove,
        linkFields,
        appendLink,
        removeLink,
        uploading,
        onFilesChange,
        removeImage,
        handlePriceAdjust,
        handleDiscountPriceAdjust,
        handleQuotaAdjust,
        onSubmit,
        isPending: updateMutation.isPending,
        isLoadingProduct,
        product,
    };
}
