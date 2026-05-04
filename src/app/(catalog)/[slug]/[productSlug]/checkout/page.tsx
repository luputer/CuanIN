"use client";

export const dynamic = "force-dynamic";

import {
  ArrowLeftIcon,
  SpinnerIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  SealPercentIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type FormFieldData = {
  id: string;
  label: string;
  type: string;
  options: unknown;
  required: boolean;
  order: number;
};

type CheckoutFormValues = {
  name: string;
  email: string;
  phone: string;
  promo?: string;
  custom?: Record<string, string>;
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const slug = params.slug as string;
  const productSlug = params.productSlug as string;

  const { data: product, isLoading } = api.catalog.getProductById.useQuery({
    slug,
    productSlug,
  });

  const formFields = React.useMemo(() => {
    return (product as { formFields?: FormFieldData[] })?.formFields ?? [];
  }, [product]);

  const price = Number(product?.price ?? 0);
  const isGratis = price === 0;
  const isBuyingOwnProduct =
    status === "authenticated" && session.user.id === product?.userId;

  const CATEGORY_STYLE: Record<string, string> = {
    WEBINAR: "bg-cyan-100 text-cyan-700 border-cyan-200",
    KELAS_ONLINE: "bg-amber-100 text-amber-700 border-amber-200",
    DIGITAL_PRODUCT: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const CATEGORY_NAME: Record<string, string> = {
    WEBINAR: "Webinar",
    KELAS_ONLINE: "Kelas",
    DIGITAL_PRODUCT: "Produk Digital",
  };

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

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = form;

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

  const handleGoogleCheckoutSignIn = async () => {
    setIsGoogleLoading(true);
    document.cookie =
      "checkout_google_sso=1; Max-Age=600; path=/; SameSite=Lax";

    try {
      await signIn("google", {
        callbackUrl: window.location.href,
      });
    } catch (error) {
      setIsGoogleLoading(false);
      toast.error("Gagal login dengan Google");
    }
  };

  const handleCheckoutSignOut = async () => {
    document.cookie = "checkout_google_sso=; Max-Age=0; path=/; SameSite=Lax";
    setValue("name", "");
    setValue("email", "");

    await signOut({
      callbackUrl: window.location.href,
    });
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
      answers,
    });
  };

  const inputClass = (err?: boolean) =>
    `w-full px-4 py-2.5 rounded-xl border transition bg-white
        ${err
      ? "border-red-400 focus:border-red-500 bg-red-50"
      : "border-slate-300 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-100"
    }`;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <SpinnerIcon className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Produk tidak ditemukan</p>
      </div>
    );
  }

  const renderFormField = (field: FormFieldData) => {
    const options = Array.isArray(field.options)
      ? (field.options as string[])
      : [];
    const fieldError = errors?.custom?.[field.id];

    switch (field.type) {
      case "SHORT":
        return (
          <input
            {...register(`custom.${field.id}`)}
            placeholder={`Masukkan ${field.label.toLowerCase()}`}
            className={inputClass(!!fieldError)}
          />
        );
      case "LONG":
        return (
          <textarea
            {...register(`custom.${field.id}`)}
            placeholder={`Masukkan ${field.label.toLowerCase()}`}
            rows={3}
            className={inputClass(!!fieldError)}
          />
        );
      case "MULTIPLE_CHOICE":
        return (
          <div className="space-y-2">
            {options.map((opt, i) => (
              <label
                key={i}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="radio"
                  value={opt}
                  {...register(`custom.${field.id}`)}
                />
                {opt}
              </label>
            ))}
          </div>
        );
      case "CHECKBOX":
        return (
          <div className="space-y-2">
            {options.map((opt, i) => {
              const current = form.watch(`custom.${field.id}`)! ?? "";
              const values = current.split(",").filter(Boolean);
              const checked = values.includes(opt);
              return (
                <label
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const newValues = checked
                        ? values.filter((v) => v !== opt)
                        : [...values, opt];
                      form.setValue(`custom.${field.id}`, newValues.join(","), {
                        shouldValidate: true,
                      });
                    }}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        );
      case "DROPDOWN":
        return (
          <select
            {...register(`custom.${field.id}`)}
            className={inputClass(!!fieldError)}
          >
            <option value="">Pilih {field.label.toLowerCase()}</option>
            {options.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            {...register(`custom.${field.id}`)}
            className={inputClass(!!fieldError)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="sticky top-0 z-10 border-b border-slate-300 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <Link
            href={`/${slug}/${productSlug}`}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">Checkout</h1>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
          {/* LEFT */}
          <div className="space-y-6 pb-50 lg:col-span-3">
            {/* PRODUCT CARD */}
            <div className="flex flex-col gap-5 rounded-xl border border-slate-300 bg-white p-5 sm:flex-row">
              <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-40 md:w-44 lg:w-48">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    unoptimized
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    No Images
                  </div>
                )}
              </div>
              <div className="mt-1 flex h-full min-w-0 flex-col space-y-2">
                <span
                  className={`w-fit rounded-full border px-3 py-1 text-xs ${CATEGORY_STYLE[product.type]}`}
                >
                  {CATEGORY_NAME[product.type] || product.type}
                </span>
                <h2 className="mb-4 text-lg font-bold break-words text-slate-800">
                  {product.name}
                </h2>
                <div className="mb-2 space-y-1">
                  {(product.benefit as string[])?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 text-sm text-slate-800"
                    >
                      <CheckCircleIcon
                        className="h-5 w-5 shrink-0 text-green-600"
                        weight="fill"
                      />
                      <span className="min-w-0 break-words">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-lg font-bold text-cyan-600">
                  {isGratis ? "Gratis" : `Rp ${price.toLocaleString("id-ID")}`}
                </div>
              </div>
            </div>

            {/* FORM */}
            <form
              id="checkout-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5 rounded-xl border border-slate-300 bg-white p-6 shadow-[0_-4px_0px_0px_rgba(0,146,184,100)]"
            >
              {status === "authenticated" && (
                <div className="mb-4 flex items-center justify-between rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2">

                  {/* LEFT: identity */}
                  <div className="flex flex-col">
                    <div className="text-xs text-cyan-700">
                      Login sebagai
                    </div>
                    <div className="text-sm font-medium text-cyan-800 truncate max-w-[220px]">
                      {session.user.email}
                    </div>
                  </div>

                  {/* RIGHT: action */}
                  <button
                    type="button"
                    onClick={handleCheckoutSignOut}
                    className="text-sm font-medium text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                  >
                    Logout
                  </button>

                </div>
              )}
              <div className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-slate-700">
                    Isi Data Diri
                  </div>
                  <p className="text-sm text-slate-700">
                    Silakan isi data berikut untuk melanjutkan proses checkout
                  </p>
                </div>
              </div>
              {status !== "authenticated" && (
                <button
                  type="button"
                  onClick={handleGoogleCheckoutSignIn}
                  disabled={isGoogleLoading}
                  aria-busy={isGoogleLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  {isGoogleLoading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      Menghubungkan...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Lanjutkan dengan Google
                    </>
                  )}
                </button>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-700">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  className={inputClass(!!errors.name)}
                  placeholder="Masukkan nama lengkap"
                  readOnly={status === "authenticated" && !!session.user.name}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("email")}
                  className={inputClass(!!errors.email)}
                  placeholder="contoh: nama@gmail.com"
                  readOnly={status === "authenticated" && !!session.user.email}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-700">
                  No HP <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("phone")}
                  className={inputClass(!!errors.phone)}
                  placeholder="contoh: 081234567890"
                  readOnly={status === "authenticated" && !!session.user.phone}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {formFields.length > 0 && (
                <div className="space-y-4 border-t border-slate-200 pt-4">
                  {formFields.map((field) => (
                    <div key={field.id} className="flex flex-col gap-2">
                      <label className="text-sm text-slate-700">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500"> *</span>
                        )}
                      </label>
                      {renderFormField(field)}
                      {errors?.custom?.[field.id] && (
                        <p className="text-xs text-red-500">
                          {errors.custom[field.id]?.message?.toString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* RIGHT */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-2 lg:h-fit lg:self-start">
            {/* VOUCHER */}
            <div className="rounded-xl border border-slate-300 bg-white p-5">
              <label className="text-sm text-slate-700">Voucher</label>
              <div className="mt-2 flex gap-3">
                <div className="relative flex-1">
                  <SealPercentIcon
                    className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-yellow-400"
                    weight="fill"
                  />
                  <input
                    {...register("promo")}
                    className="w-full rounded-xl border border-slate-300 py-2.5 pr-4 pl-10 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-100"
                    placeholder="Masukkan kode voucher"
                  />
                </div>
                <button className="cursor-pointer rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-yellow-600">
                  Pakai
                </button>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="rounded-xl border border-slate-300 bg-white p-6">
              <h3 className="mb-4 border-b border-slate-300 pb-3 font-semibold text-slate-800">
                Detail Pembayaran
              </h3>
              {isBuyingOwnProduct && (
                <div className="mb-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">

                  {/* ICON */}
                  <WarningCircleIcon
                    className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
                    weight="fill"
                  />

                  {/* TEXT */}
                  <div className="space-y-1 leading-relaxed">
                    <p className="font-medium">
                      Tidak dapat melakukan pembelian
                    </p>
                    <p className="text-amber-700/80">
                      Kamu sedang login sebagai pemilik produk ini. Gunakan akun
                      pembeli atau logout untuk mencoba checkout.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span className="font-bold text-cyan-600">
                  {isGratis ? "Rp0" : `Rp ${price.toLocaleString("id-ID")}`}
                </span>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={purchaseMutation.isPending || isBuyingOwnProduct}
                className="mt-6 w-full rounded-xl bg-cyan-600 py-3 font-medium text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {purchaseMutation.isPending
                  ? "Memproses..."
                  : isBuyingOwnProduct
                    ? "Tidak Bisa Beli Produk Sendiri"
                    : "Bayar Sekarang"}
              </button>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheckIcon className="h-4 w-4" />
                Aman & terenkripsi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
