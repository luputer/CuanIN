import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(2, "Nama wajib diisi"),
    email: z.string().email("Format email tidak valid"),
    phone: z
      .string()
      .min(10, "Nomor HP minimal 10 digit")
      .regex(
        /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
        "Format nomor HP tidak valid (contoh: 08123456789)",
      ),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, "Email tidak boleh kosong"),
  password: z.string().min(1, "Password tidak boleh kosong"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const webinarSchema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi"),
    shortDescription: z
      .string()
      .min(1, "Ringkasan wajib diisi")
      .max(200, "Ringkasan maksimal 200 karakter"),
    description: z.string().min(1, "Deskripsi wajib diisi"),
    price: z.number().min(0, "Harga tidak boleh negatif").optional(),
    contentType: z.string().min(1, "Platform wajib dipilih"),
    platformCustom: z.string().optional(),
    link: z
      .string()
      .min(1, "Link wajib diisi")
      .url("Link tidak valid, pastikan format URL benar (https://...)"),
    notes: z.string().optional(),
    status: z.string().min(1, "Status wajib dipilih"),
    dateStart: z.date({ required_error: "Jadwal Webinar wajib diisi" }),
    dateEnd: z.date({ required_error: "Jadwal Webinar wajib diisi" }),
    dateDeadline: z.date({ required_error: "Batas pendaftaran wajib diisi" }),
    capacity: z
      .number({ required_error: "Kuota wajib diisi" })
      .min(0, "Kuota tidak boleh negatif")
      .optional(),
    benefit: z.array(z.string()).optional(),
    image: z.string().optional(),
    images: z.array(z.string()).max(4).optional(),
    enableVoucher: z.boolean().default(false),
    vouchers: z.array(z.string()).optional(),
    enableNotes: z.boolean().default(false),
    enableDiscount: z.boolean().default(false),
    enableQuota: z.boolean().default(false),
    discountPrice: z.number().min(0).optional(),
  })

  .refine(
    (data) => {
      if (data.dateStart && data.dateEnd) {
        return data.dateEnd > data.dateStart;
      }
      return true;
    },
    {
      message: "Waktu selesai harus setelah waktu mulai",
      path: ["dateEnd"],
    },
  )
  .refine(
    (data) => {
      if (data.dateStart && data.dateDeadline) {
        return data.dateDeadline <= data.dateStart;
      }
      return true;
    },
    {
      message: "Batas pendaftaran tidak boleh setelah waktu mulai",
      path: ["dateDeadline"],
    },
  )
  .refine(
    (data) => {
      if (data.contentType === "other") {
        return !!data.platformCustom && data.platformCustom.trim().length > 0;
      }
      return true;
    },
    {
      message: "Nama platform wajib diisi jika memilih 'Lainnya'",
      path: ["platformCustom"],
    },
  )
  .refine(
    (data) => {
      if (data.enableDiscount && data.price !== undefined && data.discountPrice !== undefined) {
        return data.discountPrice < data.price;
      }
      return true;
    },
    {
      message: "Harga diskon harus lebih rendah dari harga asli",
      path: ["discountPrice"],
    }
  );

export const baseProductDigitalSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  shortDescription: z
    .string()
    .min(1, "Ringkasan wajib diisi")
    .max(200, "Ringkasan maksimal 200 karakter"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  price: z.number().min(0, "Harga tidak boleh negatif").optional(),
  link: z
    .string()
    .min(1, "Link wajib diisi")
    .url("Link tidak valid, pastikan format URL benar (https://...)"),
  contentType: z.string().min(1, "Tipe konten wajib dipilih"),
  platformCustom: z.string().optional(),
  duration: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().min(1, "Status wajib dipilih"),
  image: z.string().optional(),
  images: z.array(z.string()).max(4).optional(),
  benefit: z.array(z.string()).optional(),
  capacity: z.number().min(0, "Stok tidak boleh negatif").optional(),
  enableQuota: z.boolean().default(false),
  enableVoucher: z.boolean().default(false),
  vouchers: z.array(z.string()).optional(),
  enableNotes: z.boolean().default(false),
  enableDiscount: z.boolean().default(false),
  discountPrice: z.number().min(0).optional(),
});

export const productDigitalSchema = baseProductDigitalSchema

  .refine(
    (data) => {
      if (data.enableDiscount && data.price !== undefined && data.discountPrice !== undefined) {
        return data.discountPrice < data.price;
      }
      return true;
    },
    {
      message: "Harga diskon harus lebih rendah dari harga asli",
      path: ["discountPrice"],
    }
  )
  .refine(
    (data) => {
      if (data.contentType === "other") {
        return !!data.platformCustom && data.platformCustom.trim().length > 0;
      }
      return true;
    },
    {
      message: "Nama tipe konten wajib diisi jika memilih 'Lainnya'",
      path: ["platformCustom"],
    }
  );

export type DigitalProductFormValues = z.infer<typeof baseProductDigitalSchema>;

export const productKelasOnlineSchema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi"),
    shortDescription: z
      .string()
      .min(1, "Ringkasan wajib diisi")
      .max(200, "Ringkasan maksimal 200 karakter"),
    description: z.string().min(1, "Deskripsi wajib diisi"),
    price: z.number().min(0, "Harga tidak boleh negatif").optional(),
    link: z
      .string()
      .min(1, "Link wajib diisi")
      .url("Link tidak valid, pastikan format URL benar (https://...)"),
    contentType: z.string().min(1, "Platform wajib dipilih"),
    platformCustom: z.string().optional(),
    duration: z.string().min(1, "Durasi wajib diisi"),
    notes: z.string().optional(),
    status: z.string().min(1, "Status wajib dipilih"),
    image: z.string().optional(),
    images: z.array(z.string()).max(4).optional(),
    benefit: z.array(z.string()).optional(),
    capacity: z.number().min(0, "Kuota tidak boleh negatif").optional(),
    enableQuota: z.boolean().default(false),
    enableVoucher: z.boolean().default(false),
    vouchers: z.array(z.string()).optional(),
    enableNotes: z.boolean().default(false),
    enableDiscount: z.boolean().default(false),
    discountPrice: z.number().min(0).optional(),
  })

  .refine(
    (data) => {
      if (data.enableDiscount && data.price !== undefined && data.discountPrice !== undefined) {
        return data.discountPrice < data.price;
      }
      return true;
    },
    {
      message: "Harga diskon harus lebih rendah dari harga asli",
      path: ["discountPrice"],
    }
  )
  .refine(
    (data) => {
      if (data.contentType === "other") {
        return !!data.platformCustom && data.platformCustom.trim().length > 0;
      }
      return true;
    },
    {
      message: "Nama platform wajib diisi jika memilih 'Lainnya'",
      path: ["platformCustom"],
    }
  );

// schema withdrawlScema
export const withdrawalSchema = z.object({
  amount: z.preprocess(
    (value) => {
      if (typeof value === "string") {
        return value.replace(/\D/g, "");
      }

      return value;
    },
    z.coerce
      .number({ invalid_type_error: "Jumlah harus berupa angka" })
      .int("Jumlah harus bilangan bulat")
      .positive("Jumlah harus lebih dari 0"),
  ),
  bank: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(["bca", "bni", "bri", "mandiri", "cimb", "bsi"], {
      required_error: "Pilih bank tujuan",
      invalid_type_error: "Pilih bank tujuan",
    }),
  ),
  accountNumber: z
    .string()
    .min(5, "Nomor rekening minimal 5 digit")
    .regex(/^\d+$/, "Nomor rekening hanya boleh berisi angka"),
  accountHolderName: z
    .string()
    .min(2, "Nama pemilik rekening wajib diisi")
    .max(100, "Nama terlalu panjang"),
  email: z.string().email("Format email tidak valid"),
});

export type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

export const creatorSchema = z.object({
  name: z.string().min(1, "Nama kreator wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  phone: z
    .string()
    .min(10, "Nomor HP minimal 10 digit")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
      "Format nomor HP tidak valid (contoh: 08123456789)",
    ),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
  image: z.string().optional().nullable(),
  banner: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
});

export type CreatorFormValues = z.infer<typeof creatorSchema>;
