import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { webinarSchema } from "~/lib/validation";
import { formatNumberInput } from "~/lib/utils";
import { useImageUpload } from "~/hooks/use-upload";
import type { FormField } from "~/components/form-customizer";
import type { z } from "zod";

type WebinarFormValues = z.infer<typeof webinarSchema>;

export function useCreateWebinar() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const utils = api.useUtils();
    
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [createdProduct, setCreatedProduct] = useState<{name: string, slug: string} | null>(null);

    // Form Customizer State (controlled)
    const [customFields, setCustomFields] = useState<FormField[]>([]);

    const { uploading, handleFileUpload } = useImageUpload("products");

    const form = useForm<WebinarFormValues>({
        resolver: zodResolver(webinarSchema) as any,
        defaultValues: {
            contentType: "zoom",
            status: "published",
            price: 0,
            capacity: 0,
            notes: "",
            benefit: [""],
            enableVoucher: false,
            vouchers: [],
            enableNotes: false,
            enableDiscount: false,
            discountPrice: 0,
            enableQuota: false,
            image: "",
            images: [],
        },
    });

    const { setValue, getValues, watch, handleSubmit, control } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "benefit" as never,
    });

    const dateStart = watch("dateStart");
    const dateEnd = watch("dateEnd");
    const dateDeadline = watch("dateDeadline");
    const images = watch("images") || [];

    const handlePriceAdjust = (amount: number) => {
        const currentPrice = Number(getValues("price")?.toString() ?? "0");
        const newPrice = Math.max(0, currentPrice + amount);
        setValue("price", newPrice, { shouldValidate: true, shouldDirty: true });
    };

    const handleDiscountPriceAdjust = (amount: number) => {
        const currentDiscount = Number(getValues("discountPrice")?.toString() ?? "0");
        const newDiscount = Math.max(0, currentDiscount + amount);
        setValue("discountPrice", newDiscount, { shouldValidate: true, shouldDirty: true });
    };

    const handleQuotaAdjust = (amount: number) => {
        const currentQuota = Number(getValues("capacity") ?? 0);
        const newQuota = Math.max(0, currentQuota + amount);
        setValue("capacity", newQuota, { shouldValidate: true, shouldDirty: true });
    };

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

    const saveMutation = api.formFields.save.useMutation();

    const createWebinar = api.products.create.useMutation({
        onSuccess: async (product) => {
            if (customFields.length > 0) {
                try {
                    await saveMutation.mutateAsync({
                        productId: product.id,
                        fields: customFields.map((f, index) => ({
                            id: f.id,
                            label: f.label.trim() || "Pertanyaan Tanpa Judul",
                            type: f.type,
                            required: f.required,
                            options: f.options,
                            order: index,
                        })),
                    });
                } catch (e) {
                    console.error("Gagal menyimpan kustomisasi form:", e);
                }
            }

            void utils.products.getAll.invalidate();
            setCreatedProduct({
                name: product.name,
                slug: product.slug ?? product.id
            });
            setSuccessDialogOpen(true);
        },
        onError: (error) => {
            toast.error(`Gagal membuat webinar: ${error.message}`);
        },
    });

    const onSubmit = (data: WebinarFormValues) => {
        const actualContentType = data.contentType === "other" ? data.platformCustom : data.contentType;

        createWebinar.mutate({
            type: "WEBINAR",
            name: data.name,
            shortDescription: data.shortDescription,
            description: data.description,
            price: data.price ?? 0,
            contentType: actualContentType,
            link: data.link ?? undefined,
            notes: data.enableNotes ? data.notes : undefined,
            status: data.status,
            startDate: data.dateStart,
            endDate: data.dateEnd,
            dateDeadline: data.dateDeadline,
            capacity: data.enableQuota ? data.capacity : 0,
            benefit: data.benefit?.filter((b) => b.trim() !== ""),
            image: data.image,
            images: data.images,
            vouchers: data.enableVoucher ? data.vouchers : [],
            discountPrice: data.enableDiscount ? data.discountPrice : undefined,
        });
    };

    return {
        form,
        router,
        state: {
            successDialogOpen,
            setSuccessDialogOpen,
            createdProduct,
            customFields,
            setCustomFields,
            images,
            uploading,
            fileInputRef,
            dateStart,
            dateEnd,
            dateDeadline,
            isPending: createWebinar.isPending || saveMutation.isPending
        },
        fields: {
            benefitFields: fields,
            appendBenefit: append,
            removeBenefit: remove,
        },
        handlers: {
            handlePriceAdjust,
            handleDiscountPriceAdjust,
            handleQuotaAdjust,
            onFilesChange,
            removeImage,
            onSubmit: handleSubmit(onSubmit)
        }
    };
}

