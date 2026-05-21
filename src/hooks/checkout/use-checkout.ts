"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export type FormFieldData = {
  id: string;
  label: string;
  type: string;
  options: unknown;
  required: boolean;
  order: number;
};

export type CheckoutFormValues = {
  name: string;
  email: string;
  phone: string;
  promo?: string;
  custom?: Record<string, string>;
};

export type AppliedVoucher = {
  id: string;
  code: string;
  name: string;
  type: "PERSEN" | "NOMINAL";
  discount: number;
};

export function useCheckout() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [appliedVoucher, setAppliedVoucher] = React.useState<AppliedVoucher | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = React.useState(false);
  const [voucherError, setVoucherError] = React.useState<string | null>(null);

  const slug = params.slug as string;
  const productSlug = params.productSlug as string;

  const { data: product, isLoading } = api.catalog.getProductById.useQuery({
    slug,
    productSlug,
  });

  const apiUtils = api.useUtils();

  const formFields = React.useMemo(() => {
    return (product as { formFields?: FormFieldData[] })?.formFields ?? [];
  }, [product]);

  const price = Number(product?.price ?? 0);

  const discountAmount = React.useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.type === "PERSEN") {
      return Math.round((price * appliedVoucher.discount) / 100);
    }
    return appliedVoucher.discount;
  }, [appliedVoucher, price]);

  const finalPrice = Math.max(0, price - discountAmount);
  const isGratis = finalPrice === 0;
  const isBuyingOwnProduct =
    status === "authenticated" && session.user.id === product?.userId;

  const schema = React.useMemo(() => {
    const base = {
      name: z.string().min(1, "Nama wajib diisi"),
      email: z.string().email("Email wajib diisi"),
      phone: z.string().min(1, "Nomor HP wajib diisi"),
      promo: z.string().optional(),
    };

    const customShape: Record<string, z.ZodTypeAny> = {};
    formFields.forEach((f) => {
      if (f.required) {
        customShape[f.id] = z.string().min(1, `${f.label} wajib diisi`);
      } else {
        customShape[f.id] = z.string().optional();
      }
    });

    return z.object({ ...base, custom: z.object(customShape).optional() });
  }, [formFields]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", promo: "", custom: {} },
  });

  const { getValues, setValue } = form;

  React.useEffect(() => {
    if (status !== "authenticated") return;

    if (session.user.name && !getValues("name")) {
      setValue("name", session.user.name, { shouldValidate: true });
    }

    if (session.user.email && !getValues("email")) {
      setValue("email", session.user.email, { shouldValidate: true });
    }

    if (session?.user?.phone && !getValues("phone")) {
      setValue("phone", session.user.phone, { shouldValidate: true });
    }

    document.cookie = "checkout_google_sso=; Max-Age=0; path=/; SameSite=Lax";
  }, [getValues, session, setValue, status]);

  const handleApplyVoucher = async () => {
    const promoValue = form.getValues("promo");
    if (!promoValue?.trim()) {
      setVoucherError("Silakan masukkan kode voucher terlebih dahulu");
      return;
    }
    if (!product) return;

    setVoucherError(null);
    setIsValidatingVoucher(true);
    try {
      const data = await apiUtils.vouchers.validatePromoCode.fetch({
        code: promoValue.trim(),
        productId: product.id,
        buyerEmail: form.getValues("email"),
      });
      setAppliedVoucher(data as AppliedVoucher);
      setVoucherError(null);
      toast.success(`Voucher "${data.name}" berhasil diterapkan!`);
    } catch (err: unknown) {
      setAppliedVoucher(null);
      const message = err instanceof Error ? err.message : "Kode voucher tidak valid";
      setVoucherError(message);
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError(null);
    form.setValue("promo", "");
  };

  const purchaseMutation = api.purchases.create.useMutation({
    onSuccess: (data) => {
      if (data.status === "free") {
        toast.success("Berhasil daftar!");
        router.push(`/${slug}`);
        return;
      }
      router.push(`/payment/${data.purchase.id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const onSubmit = (data: CheckoutFormValues) => {
    if (isBuyingOwnProduct) {
      toast.error("Kamu tidak bisa membeli produk milik sendiri.");
      return;
    }

    const answers = Object.entries(data.custom ?? {}).map(([id, value]) => ({
      formFieldId: id,
      answer: value,
    }));

    purchaseMutation.mutate({
      productId: product!.id,
      buyerName: data.name,
      buyerEmail: data.email,
      buyerPhone: data.phone,
      promoCode: appliedVoucher ? data.promo : undefined,
      answers,
    });
  };

  return {
    form,
    session,
    status,
    product,
    isLoading,
    isGoogleLoading,
    setIsGoogleLoading,
    appliedVoucher,
    isValidatingVoucher,
    voucherError,
    setVoucherError,
    handleApplyVoucher,
    handleRemoveVoucher,
    onSubmit,
    purchaseMutation,
    price,
    discountAmount,
    finalPrice,
    isGratis,
    isBuyingOwnProduct,
    formFields,
    slug,
    productSlug
  };
}
