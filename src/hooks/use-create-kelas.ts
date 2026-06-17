import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { productKelasOnlineSchema } from "~/lib/validation";
import { useImageUpload } from "~/hooks/use-upload";
import type { FormField } from "~/components/form-customizer";
import type { z } from "zod";

type KelasOnlineFormValues = z.infer<typeof productKelasOnlineSchema> & {
    description: string;
    price?: number;
    link: string;
    contentType?: string;
    platformCustom?: string;
    duration: string;
    notes?: string;
    status: string;
    image?: string;
    images?: string[];
    benefit?: string[];
    capacity?: number;
    enableQuota?: boolean;
    enableVoucher?: boolean;
    vouchers?: string[];
    enableNotes?: boolean;
    enableDiscount?: boolean;
    discountPrice?: number;
    enablePortal?: boolean;
};

export function useCreateKelas() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const utils = api.useUtils();

    const [successDialogOpen, setSuccessDialogOpen] = useState(false);
    const [createdProduct, setCreatedProduct] = useState<{name: string, slug: string} | null>(null);

    // Form Customizer State
    const [customFields, setCustomFields] = useState<FormField[]>([]);

    const { uploading, handleFileUpload } = useImageUpload("products");

    const form = useForm<KelasOnlineFormValues>({
        resolver: zodResolver(productKelasOnlineSchema) as any,
        defaultValues: {
            status: "published",
            price: 0,
            benefit: [""],
            links: [],
            contentType: "zoom",
            platformCustom: "",
            capacity: 0,
            enableQuota: false,
            enableNotes: false,
            notes: "",
            enableVoucher: false,
            vouchers: [],
            enableDiscount: false,
            discountPrice: 0,
            image: "",
            images: [],
            enablePortal: false,
        },
    });

    const { setValue, getValues, watch, handleSubmit, control } = form;

    const {
        fields: linkFields,
        append: appendLink,
        remove: removeLink,
    } = useFieldArray({
        control,
        name: "links" as never,
    });

    const images = watch("images") || [];
    const description = watch("description");

    const handlePriceAdjust = (amount: number) => {
        const currentPrice = Number(getValues("price")?.toString() ?? "0");
        const newPrice = Math.max(0, currentPrice + amount);
        setValue("price", newPrice, { shouldValidate: true, shouldDirty: true });
    };

    const handleDiscountPriceAdjust = (amount: number) => {
        const currentPrice = Number(getValues("discountPrice")?.toString() ?? "0");
        const newPrice = Math.max(0, currentPrice + amount);
        setValue("discountPrice", newPrice, { shouldValidate: true, shouldDirty: true });
    };

    const handleQuotaAdjust = (amount: number) => {
        const currentQuota = Number(getValues("capacity")?.toString() ?? "0");
        const newQuota = Math.max(1, currentQuota + amount);
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

    const createProduct = api.products.create.useMutation({
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
            toast.error(`Gagal membuat kelas: ${error.message}`);
        },
    });

    const onSubmit = (data: KelasOnlineFormValues) => {
        const actualContentType = data.contentType === "other" ? data.platformCustom : data.contentType;

        createProduct.mutate({
            type: "KELAS_ONLINE",
            name: data.name,
            shortDescription: data.shortDescription,
            description: data.description,
            price: data.price ?? 0,
            contentType: actualContentType,
            link: data.link ?? undefined,
            links: data.links?.filter((l) => l.trim() !== "") ?? [],
            notes: data.enableNotes ? data.notes : undefined,
            status: data.status,
            duration: data.duration,
            capacity: data.enableQuota ? data.capacity : 0,
            benefit: data.benefit?.filter((b) => b.trim() !== ""),
            image: data.image,
            images: data.images,
            vouchers: data.enableVoucher ? data.vouchers : [],
            discountPrice: data.enableDiscount ? data.discountPrice : undefined,
            portalEnabled: data.enablePortal,
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
            description,
            linkFields,
            appendLink,
            removeLink,
            isPending: createProduct.isPending || saveMutation.isPending
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

