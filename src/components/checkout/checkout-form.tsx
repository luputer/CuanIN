"use client";

import React from "react";
import { signIn, signOut } from "next-auth/react";
import type { UseFormReturn } from "react-hook-form";
import type { CheckoutFormValues, FormFieldData } from "~/hooks/checkout/use-checkout";
import { toast } from "sonner";

type CheckoutFormProps = {
  form: UseFormReturn<CheckoutFormValues>;
  status: "authenticated" | "unauthenticated" | "loading";
  session: any;
  isGoogleLoading: boolean;
  setIsGoogleLoading: (val: boolean) => void;
  formFields: FormFieldData[];
  onSubmit: (data: CheckoutFormValues) => void;
};

const inputClass = (err?: boolean) =>
  `w-full px-4 py-2.5 rounded-xl border transition bg-white focus:outline-none
        ${err
    ? "border-red-400 focus:border-red-500 bg-red-50"
    : "border-slate-300 focus:border-cuan-cyan focus:ring-1 focus:ring-cuan-cyan/20"
  }`;

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  form,
  status,
  session,
  isGoogleLoading,
  setIsGoogleLoading,
  formFields,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const handleGoogleCheckoutSignIn = async () => {
    setIsGoogleLoading(true);
    document.cookie = "checkout_google_sso=1; Max-Age=600; path=/; SameSite=Lax";

    try {
      await signIn("google", {
        callbackUrl: window.location.pathname + window.location.search,
      });
    } catch {
      setIsGoogleLoading(false);
      toast.error("Gagal login dengan Google");
    }
  };

  const handleCheckoutSignOut = async () => {
    document.cookie = "checkout_google_sso=; Max-Age=0; path=/; SameSite=Lax";
    setValue("name", "");
    setValue("email", "");
    setValue("phone", "");

    await signOut({
      callbackUrl: window.location.pathname + window.location.search,
    });
  };

  const renderFormField = (field: FormFieldData) => {
    const options = Array.isArray(field.options) ? (field.options as string[]) : [];
    const fieldError = (errors.custom as any)?.[field.id];

    switch (field.type) {
      case "SHORT":
        return (
          <input
            {...register(`custom.${field.id}` as any)}
            placeholder={`Masukkan ${field.label.toLowerCase()}`}
            className={inputClass(!!fieldError)}
          />
        );
      case "LONG":
        return (
          <textarea
            {...register(`custom.${field.id}` as any)}
            placeholder={`Masukkan ${field.label.toLowerCase()}`}
            rows={3}
            className={inputClass(!!fieldError)}
          />
        );
      case "MULTIPLE_CHOICE":
        return (
          <div className="space-y-2">
            {options.map((opt, _i) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input type="radio" value={opt} {...register(`custom.${field.id}` as any)} className="accent-cuan-cyan w-4 h-4 cursor-pointer" />
                {opt}
              </label>
            ))}
          </div>
        );
      case "CHECKBOX":
        return (
          <div className="space-y-2">
            {options.map((opt, _i) => {
              const current = watch(`custom.${field.id}` as any) ?? "";
              const values = current.split(",").filter(Boolean);
              const checked = values.includes(opt);
              return (
                <label key={opt} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    className="accent-cuan-cyan w-4 h-4 rounded cursor-pointer"
                    onChange={() => {
                      const newValues = checked
                        ? values.filter((v: string) => v !== opt)
                        : [...values, opt];
                      setValue(`custom.${field.id}` as any, newValues.join(","), {
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
          <select {...register(`custom.${field.id}` as any)} className={inputClass(!!fieldError)}>
            <option value="">Pilih {field.label.toLowerCase()}</option>
            {options.map((opt, _i) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input {...register(`custom.${field.id}` as any)} className={inputClass(!!fieldError)} />
        );
    }
  };

  return (
    <form
      id="checkout-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-xl border border-slate-300 bg-white p-6 shadow-[0_-4px_0px_0px_#00B3E9]"
    >
      {status === "authenticated" && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-cuan-cyan/20 bg-cuan-cyan/10 px-3 py-2">
          <div className="flex flex-col">
            <div className="text-xs text-007EA5">Login sebagai</div>
            <div className="max-w-[220px] truncate text-sm font-medium text-cyan-800">
              {session.user.email}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCheckoutSignOut}
            className="cursor-pointer text-sm font-medium text-red-500 hover:text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="text-lg font-semibold text-slate-700">Isi Data Diri</div>
          <p className="text-sm text-slate-700">
            Silakan isi data berikut untuk melanjutkan proses checkout
          </p>
        </div>
      </div>

      {status === "unauthenticated" && (
        <button
          type="button"
          onClick={handleGoogleCheckoutSignIn}
          disabled={isGoogleLoading}
          aria-busy={isGoogleLoading}
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGoogleLoading ? (
            <>
              <span className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              Menghubungkan...
            </>
          ) : (
            <>
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
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
          readOnly={status === "authenticated" && !!session?.user?.name}
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          {...register("email")}
          className={inputClass(!!errors.email)}
          placeholder="contoh: nama@gmail.com"
          readOnly={status === "authenticated" && !!session?.user?.email}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-700">
          No HP <span className="text-red-500">*</span>
        </label>
        <input
          {...register("phone")}
          className={inputClass(!!errors.phone)}
          placeholder="contoh: 081234567890"
          readOnly={status === "authenticated" && !!session?.user?.phone}
        />
        {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      {formFields.length > 0 && (
        <div className="space-y-4 border-t border-slate-200 pt-4">
          {formFields.map((field) => (
            <div key={field.id} className="flex flex-col gap-2">
              <label className="text-sm text-slate-700">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>
              {renderFormField(field)}
              {(errors.custom as any)?.[field.id] && (
                <p className="text-xs text-red-500">
                  {(errors.custom as any)[field.id]?.message?.toString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </form>
  );
};
