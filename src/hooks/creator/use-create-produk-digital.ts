import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useImageUpload } from "~/hooks/shared/use-upload";
import { productDigitalSchema, type DigitalProductFormValues } from "~/lib/validation";
import type { FormField } from "~/components/creator/form-customizer";

export function useCreateProdukDigital() {
    const router = useRouter();
    const utils = api.useUtils();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [createdProduct, setCreatedProduct] = useState<{name: string, slug: string} | null>(null);
    const [customFields, setCustomFields] = useState<FormField[]>([]);

    const form = useForm<DigitalProductFormValues>({
        resolver: zodResolver(productDigitalSchema),
        defaultValues: {
            status: "published",
            price: 0,
            benefit: [""],
            links: [""],
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
            enablePortal: false,
            image: "",
            images: [],
        },
    });

    const { control, setValue, handleSubmit, getValues } = form;

    const { uploading, handleFileUpload } = useImageUpload("products");

    const onFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = await handleFileUpload(e);
        if (url) {
            const currentImages = getValues("images") || [];
            if (currentImages.length < 4) {
                const newImages = [...currentImages, url];
                setValue("images", newImages, { shouldValidate: true, shouldDirty: true });
                if (!getValues("image")) {
                    setValue("image", url, { shouldValidate: true, shouldDirty: true });
                }
            } else {
                toast.error("Maksimal 4 gambar");
            }
        }
        e.target.value = "";
    };

    const removeImage = (index: number) => {
        const currentImages = getValues("images") || [];
        const newImages = currentImages.filter((_, i) => i !== index);
        setValue("images", newImages, { shouldValidate: true, shouldDirty: true });
        if (getValues("image") === currentImages[index]) {
            setValue("image", newImages[0] || "", { shouldValidate: true, shouldDirty: true });
        }
    };

    const createMutation = api.products.create.useMutation({
        onSuccess: (product) => {
            void utils.products.getAll.invalidate();
            toast.success("Produk Digital berhasil dibuat");
            setCreatedProduct({
                name: product.name,
                slug: product.slug ?? product.id
            });
            setSuccessDialogOpen(true);
        },
        onError: (error) => {
            toast.error(`Gagal membuat produk digital: ${error.message}`);
        },
    });

    const onSubmit = (data: DigitalProductFormValues) => {
        const actualContentType = data.contentType === "other" ? data.platformCustom : data.contentType;
        createMutation.mutate({
            type: "DIGITAL_PRODUCT",
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
            links: data.links?.filter((l) => l.trim() !== ""),
            capacity: data.enableQuota ? data.capacity : 0,
            notes: data.enableNotes ? data.notes : undefined,
            vouchers: data.enableVoucher ? data.vouchers : [],
            discountPrice: data.enableDiscount ? data.discountPrice : undefined,
            portalEnabled: data.enablePortal,
        });
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

    return {
        form,
        router,
        state: {
            isPending: createMutation.isPending,
            uploading,
            fileInputRef,
            customFields,
            setCustomFields,
            createdProduct,
            successDialogOpen,
            setSuccessDialogOpen,
        },
        handlers: {
            onSubmit: handleSubmit(onSubmit),
            onFilesChange,
            removeImage,
            handlePriceAdjust,
            handleDiscountPriceAdjust,
            handleQuotaAdjust,
        }
    };
}
