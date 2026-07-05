"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { toast } from "sonner";

import type { FormFieldData, CheckoutFormValues, AppliedVoucher } from "~/types/form";


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

  const isSubmittedRef = React.useRef(false);
  const sessionRef = React.useRef(session);
  React.useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const { data: product, isLoading } = api.catalog.getProductById.useQuery({
    slug,
    productSlug,
  });

  const apiUtils = api.useUtils();

  const formFields = React.useMemo(() => {
    return (product as { formFields?: FormFieldData[] })?.formFields ?? [];
  }, [product]);

  const originalPrice = Number(product?.price ?? 0);
  const discountPrice = (product as any)?.discountPrice != null ? Number((product as any)?.discountPrice) : null;
  const hasDiscount = discountPrice != null && discountPrice > 0 && discountPrice < originalPrice;
  const price = hasDiscount ? discountPrice : originalPrice;

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
      phone: z.string()
        .min(1, "Nomor HP wajib diisi")
        .min(9, "Nomor HP terlalu pendek")
        .max(14, "Nomor HP terlalu panjang")
        .regex(/^\d+$/, "Nomor HP harus berupa angka saja"),
      promo: z.string().optional(),
    };

    const customShape: Record<string, z.ZodTypeAny> = {};
    formFields.forEach((f) => {
      const stringSchema = f.required
        ? z.string().min(1, `${f.label} wajib diisi`)
        : z.string().optional();

      customShape[f.id] = z.preprocess(
        (val) => (val === null || val === undefined ? "" : String(val as string | number | boolean)),
        stringSchema
      );
    });

    return z.object({ ...base, custom: z.object(customShape).optional() });
  }, [formFields]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      promo: "",
      custom: {}
    },
  });

  const { getValues, setValue, watch } = form;
  const watchedEmail = watch("email");
  const prevEmailRef = React.useRef(watchedEmail);

  React.useEffect(() => {
    // Hanya hapus jika email sudah pernah diisi dan sekarang berbeda
    if (prevEmailRef.current !== undefined && prevEmailRef.current !== watchedEmail && appliedVoucher) {
      setAppliedVoucher(null);
      setVoucherError("Email diubah, silakan terapkan kembali kode voucher.");
      toast.warning("Voucher dihapus karena email diubah.");
    }
    prevEmailRef.current = watchedEmail;
  }, [watchedEmail, appliedVoucher]);


  // 2. Autofill dari session aktif (jika pengguna memang sudah dalam status login, misalnya Kreator)
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
  }, [getValues, session, setValue, status]);


  React.useEffect(() => {
    const handleCleanup = () => {
      if (isSubmittedRef.current) return;

      const currentSession = sessionRef.current;
      const role = currentSession?.user?.role;
      const isNotAdminOrCreator = role && role !== "ADMIN" && role !== "CREATOR";
      const hasCheckoutCookie = document.cookie.includes("checkout_google_sso=");

      if (isNotAdminOrCreator && hasCheckoutCookie) {
        document.cookie = "checkout_google_sso=; Max-Age=0; path=/; SameSite=Lax";

        // Panggil endpoint logout dengan keepalive: true agar request tetap terkirim meskipun tab ditutup
        fetch("/api/checkout/logout", {
          method: "POST",
          keepalive: true,
        }).catch((err) => console.error("Logout API gagal:", err));

        signOut({ redirect: false }).catch((err) => console.error("Logout gagal:", err));
      }
    };

    window.addEventListener("beforeunload", handleCleanup);
    return () => {
      window.removeEventListener("beforeunload", handleCleanup);
      handleCleanup();
    };
  }, []);


  const handleApplyVoucher = async () => {
    const promoValue = form.getValues("promo");
    const email = form.getValues("email");

    // Validate email presence and format
    const emailResult = z.string().email().safeParse(email);
    if (!emailResult.success) {
      setVoucherError("Silakan isi Email dengan benar terlebih dahulu untuk menggunakan voucher");
      form.setError("email", { message: "Email wajib diisi untuk menggunakan voucher" });
      return;
    }

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
        buyerEmail: email,
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
      isSubmittedRef.current = true;
      document.cookie = "checkout_google_sso=; Max-Age=0; path=/; SameSite=Lax";

      if (data.status === "free") {
        toast.success("Berhasil daftar!");
        router.push(`/payment/success?id=${data.purchase.id}`);
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
      answer: value ? String(value) : "",
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
    originalPrice,
    hasDiscount,
    discountAmount,
    finalPrice,
    isGratis,
    isBuyingOwnProduct,
    formFields,
    slug,
    productSlug
  };
}
