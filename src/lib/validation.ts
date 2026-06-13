import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string({ required_error: "Nama wajib diisi" }).min(2, "Nama wajib diisi"),
    email: z.string({ required_error: "Email wajib diisi" }).email("Format email tidak valid"),
    phone: z
      .string({ required_error: "Nomor HP wajib diisi" })
      .min(10, "Nomor HP minimal 10 digit")
      .regex(
        /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
        "Format nomor HP tidak valid (contoh: 08123456789)",
      ),
    password: z.string({ required_error: "Password wajib diisi" }).min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string({ required_error: "Konfirmasi password wajib diisi" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string({ required_error: "Email wajib diisi" }).min(1, "Email tidak boleh kosong"),
  password: z.string({ required_error: "Password wajib diisi" }).min(1, "Password tidak boleh kosong"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const webinarSchema = z
  .object({
    name: z.string({ required_error: "Nama wajib diisi" }).min(1, "Nama wajib diisi"),
    shortDescription: z
      .string({ required_error: "Ringkasan wajib diisi" })
      .min(1, "Ringkasan wajib diisi")
      .max(200, "Ringkasan maksimal 200 karakter"),
    description: z.string({ required_error: "Deskripsi wajib diisi" }).min(1, "Deskripsi wajib diisi"),
    price: z.number({ required_error: "Harga wajib diisi", invalid_type_error: "Harga tidak valid" }).min(0, "Harga tidak boleh negatif").optional(),
    contentType: z.string({ required_error: "Platform wajib dipilih" }).min(1, "Platform wajib dipilih"),
    platformCustom: z.string({ required_error: "Platform kustom wajib diisi" }).optional(),
    link: z
      .string({ required_error: "Link wajib diisi" })
      .min(1, "Link wajib diisi")
      .url("Link tidak valid, pastikan format URL benar (https://...)"),
    notes: z.string({ required_error: "Catatan wajib diisi" }).optional(),
    status: z.string({ required_error: "Status wajib dipilih" }).min(1, "Status wajib dipilih"),
    dateStart: z.date({ required_error: "Jadwal mulai wajib diisi", invalid_type_error: "Tanggal tidak valid" }),
    dateEnd: z.date({ required_error: "Jadwal selesai wajib diisi", invalid_type_error: "Tanggal tidak valid" }),
    dateDeadline: z.date({ required_error: "Batas pendaftaran wajib diisi", invalid_type_error: "Tanggal tidak valid" }),
    capacity: z
      .number({ required_error: "Kuota wajib diisi", invalid_type_error: "Kuota tidak valid" })
      .min(0, "Kuota tidak boleh negatif")
      .optional(),
    benefit: z.array(z.string({ required_error: "Benefit wajib diisi" })).optional(),
    image: z.string({ required_error: "Gambar wajib diunggah" }).optional(),
    images: z.array(z.string({ required_error: "Gambar wajib diunggah" })).max(4).optional(),
    enableVoucher: z.boolean({ required_error: "Voucher wajib dipilih" }).default(false),
    vouchers: z.array(z.string({ required_error: "Voucher wajib dipilih" })).optional(),
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
  )
  .refine(
    (data) => {
      if (data.enableNotes) {
        return !!data.notes && data.notes.trim().length > 0;
      }
      return true;
    },
    {
      message: "Catatan wajib diisi",
      path: ["notes"],
    }
  );

export const baseProductDigitalSchema = z.object({
  name: z.string({ required_error: "Nama wajib diisi" }).min(1, "Nama wajib diisi"),
  shortDescription: z
    .string({ required_error: "Ringkasan wajib diisi" })
    .min(1, "Ringkasan wajib diisi")
    .max(200, "Ringkasan maksimal 200 karakter"),
  description: z.string({ required_error: "Deskripsi wajib diisi" }).min(1, "Deskripsi wajib diisi"),
  price: z.number({ required_error: "Harga wajib diisi", invalid_type_error: "Harga tidak valid" }).min(0, "Harga tidak boleh negatif").optional(),
  link: z
    .string({ required_error: "Link wajib diisi" })
    .min(1, "Link wajib diisi")
    .url("Link tidak valid, pastikan format URL benar (https://...)"),
  contentType: z.string({ required_error: "Tipe konten wajib dipilih" }).min(1, "Tipe konten wajib dipilih"),
  platformCustom: z.string({ required_error: "Platform kustom wajib diisi" }).optional(),
  duration: z.string({ required_error: "Durasi wajib diisi" }).optional(),
  notes: z.string({ required_error: "Catatan wajib diisi" }).optional(),
  status: z.string({ required_error: "Status wajib dipilih" }).min(1, "Status wajib dipilih"),
  image: z.string({ required_error: "Gambar wajib diunggah" }).optional(),
  images: z.array(z.string({ required_error: "Gambar wajib diunggah" })).max(4).optional(),
    benefit: z.array(z.string({ required_error: "Benefit wajib diisi" })).optional(),
    links: z.array(z.string({ required_error: "Link wajib diisi" })).optional(),
    capacity: z.number({ required_error: "Stok wajib diisi", invalid_type_error: "Stok tidak valid" }).min(0, "Stok tidak boleh negatif").optional(),
  enableQuota: z.boolean({ required_error: "Batas stok wajib dipilih" }).default(false),
  enableVoucher: z.boolean({ required_error: "Voucher wajib dipilih" }).default(false),
  vouchers: z.array(z.string({ required_error: "Voucher wajib dipilih" })).optional(),
  enableNotes: z.boolean({ required_error: "Catatan wajib dipilih" }).default(false),
  enableDiscount: z.boolean({ required_error: "Diskon wajib dipilih" }).default(false),
  discountPrice: z.number({ required_error: "Harga diskon wajib diisi", invalid_type_error: "Harga diskon tidak valid" }).min(0).optional(),
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
  )
  .refine(
    (data) => {
      if (data.enableNotes) {
        return !!data.notes && data.notes.trim().length > 0;
      }
      return true;
    },
    {
      message: "Catatan wajib diisi",
      path: ["notes"],
    }
  );

export type DigitalProductFormValues = z.infer<typeof baseProductDigitalSchema>;

export const productKelasOnlineSchema = z
  .object({
    name: z.string({ required_error: "Nama wajib diisi" }).min(1, "Nama wajib diisi"),
    shortDescription: z
      .string({ required_error: "Ringkasan wajib diisi" })
      .min(1, "Ringkasan wajib diisi")
      .max(200, "Ringkasan maksimal 200 karakter"),
    description: z.string({ required_error: "Deskripsi wajib diisi" }).min(1, "Deskripsi wajib diisi"),
    price: z.number({ required_error: "Harga wajib diisi", invalid_type_error: "Harga tidak valid" }).min(0, "Harga tidak boleh negatif").optional(),
    link: z
      .string({ required_error: "Link wajib diisi" })
      .min(1, "Link wajib diisi")
      .url("Link tidak valid, pastikan format URL benar (https://...)"),
    contentType: z.string({ required_error: "Platform wajib dipilih" }).min(1, "Platform wajib dipilih"),
    platformCustom: z.string({ required_error: "Platform kustom wajib diisi" }).optional(),
    duration: z.string({ required_error: "Durasi wajib diisi" }).min(1, "Durasi wajib diisi"),
    notes: z.string({ required_error: "Catatan wajib diisi" }).optional(),
    status: z.string({ required_error: "Status wajib dipilih" }).min(1, "Status wajib dipilih"),
    image: z.string({ required_error: "Gambar wajib diunggah" }).optional(),
    images: z.array(z.string({ required_error: "Gambar wajib diunggah" })).max(4).optional(),
    benefit: z.array(z.string({ required_error: "Benefit wajib diisi" })).optional(),
    links: z.array(z.string({ required_error: "Link wajib diisi" })).optional(),
    capacity: z.number({ required_error: "Kuota wajib diisi", invalid_type_error: "Kuota tidak valid" }).min(0, "Kuota tidak boleh negatif").optional(),
    enableQuota: z.boolean({ required_error: "Batas kuota wajib dipilih" }).default(false),
    enableVoucher: z.boolean({ required_error: "Voucher wajib dipilih" }).default(false),
    vouchers: z.array(z.string({ required_error: "Voucher wajib dipilih" })).optional(),
    enableNotes: z.boolean({ required_error: "Catatan wajib dipilih" }).default(false),
    enableDiscount: z.boolean({ required_error: "Diskon wajib dipilih" }).default(false),
    discountPrice: z.number({ required_error: "Harga diskon wajib diisi", invalid_type_error: "Harga diskon tidak valid" }).min(0).optional(),
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
  )
  .refine(
    (data) => {
      if (data.enableNotes) {
        return !!data.notes && data.notes.trim().length > 0;
      }
      return true;
    },
    {
      message: "Catatan wajib diisi",
      path: ["notes"],
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
    .string({ required_error: "Nomor rekening wajib diisi" })
    .min(5, "Nomor rekening minimal 5 digit")
    .regex(/^\d+$/, "Nomor rekening hanya boleh berisi angka"),
  accountHolderName: z
    .string({ required_error: "Nama pemilik rekening wajib diisi" })
    .min(2, "Nama pemilik rekening wajib diisi")
    .max(100, "Nama terlalu panjang"),
  email: z.string({ required_error: "Email wajib diisi" }).email("Format email tidak valid").optional(),
});

export type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

export const creatorSchema = z.object({
  name: z.string({ required_error: "Nama kreator wajib diisi" }).min(1, "Nama kreator wajib diisi"),
  email: z.string({ required_error: "Email wajib diisi" }).email("Format email tidak valid"),
  phone: z
    .string({ required_error: "Nomor HP wajib diisi" })
    .min(10, "Nomor HP minimal 10 digit")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
      "Format nomor HP tidak valid (contoh: 08123456789)",
    ),
  password: z.string({ required_error: "Password wajib diisi" }).min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
  image: z.string({ required_error: "Gambar wajib diunggah" }).optional().nullable(),
  banner: z.string({ required_error: "Banner wajib diunggah" }).optional().nullable(),
  bio: z.string({ required_error: "Bio wajib diisi" }).optional().nullable(),
});

export type CreatorFormValues = z.infer<typeof creatorSchema>;
