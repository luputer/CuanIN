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
                "Format nomor HP tidak valid (contoh: 08123456789)"
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
        name: z.string().min(1, "Nama webinar wajib diisi"),
        shortDescription: z.string().max(200, "Ringkasan maksimal 200 karakter").optional(),
        description: z.string().min(1, "Deskripsi wajib diisi"),
        priceType: z.enum(["free", "paid"]),
        price: z.number().min(0, "Harga tidak boleh negatif").optional(),
        platform: z.string().min(1, "Platform wajib dipilih"),
        platformCustom: z.string().optional(),
        link: z
            .string()
            .min(1, "Link webinar wajib diisi")
            .url("Link tidak valid, pastikan format URL benar (https://...)"),
        notes: z.string().optional(),
        status: z.string().min(1, "Status wajib dipilih"),
        dateStart: z.date({ required_error: "Waktu mulai wajib diisi" }),
        dateEnd: z.date({ required_error: "Waktu selesai wajib diisi" }),
        dateDeadline: z.date({ required_error: "Batas pendaftaran wajib diisi" }),
        quota: z.number({ required_error: "Kuota wajib diisi" }).min(0, "Kuota tidak boleh negatif"),
        benefit: z.array(z.string()).optional(),
        image: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.priceType === "paid") {
                return data.price !== undefined && data.price > 0;
            }
            return true;
        },
        {
            message: "Harga wajib diisi untuk webinar berbayar",
            path: ["price"],
        }
    )
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
        }
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
        }
    )
    .refine(
        (data) => {
            if (data.platform === "other") {
                return !!data.platformCustom && data.platformCustom.trim().length > 0;
            }
            return true;
        },
        {
            message: "Nama platform wajib diisi jika memilih 'Lainnya'",
            path: ["platformCustom"],
        }
    );

export const baseProductDigitalSchema = z.object({
    name: z.string().min(1, "Nama produk wajib diisi"),
    shortDescription: z.string().max(200, "Ringkasan maksimal 200 karakter").optional(),
    description: z.string().min(1, "Deskripsi wajib diisi"),
    priceType: z.enum(["free", "paid"]),
    price: z.number().min(0, "Harga tidak boleh negatif").optional(),
    link: z
        .string()
        .min(1, "Link produk wajib diisi")
        .url("Link tidak valid, pastikan format URL benar (https://...)"),
    format: z.string().optional(),
    duration: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().min(1, "Status wajib dipilih"),
    image: z.string().optional(),
    benefit: z.array(z.string()).optional(),
});

export const productDigitalSchema = baseProductDigitalSchema.refine(
    (data) => {
        if (data.priceType === "paid") {
            return data.price !== undefined && data.price > 0;
        }
        return true;
    },
    {
        message: "Harga wajib diisi untuk produk berbayar",
        path: ["price"],
    }
);

export type DigitalProductFormValues = z.infer<typeof baseProductDigitalSchema>;


export const productKelasOnlineSchema = z
    .object({
        name: z.string().min(1, "Nama produk wajib diisi"),
        shortDescription: z.string().max(200, "Ringkasan maksimal 200 karakter").optional(),
        description: z.string().min(1, "Deskripsi wajib diisi"),
        priceType: z.enum(["free", "paid"]),
        price: z.number().min(0, "Harga tidak boleh negatif").optional(),
        link: z
            .string()
            .min(1, "Link produk wajib diisi")
            .url("Link tidak valid, pastikan format URL benar (https://...)"),
        duration: z.string().optional(),
        notes: z.string().optional(),
        status: z.string().min(1, "Status wajib dipilih"),
        image: z.string().optional(),
        benefit: z.array(z.string()).optional(),
    })
    .refine(
        (data) => {
            if (data.priceType === "paid") {
                return data.price !== undefined && data.price > 0;
            }
            return true;
        },
        {
            message: "Harga wajib diisi untuk produk berbayar",
            path: ["price"],
        }
    );


// schema withdrawlScema
export const withdrawalSchema = z.object({
    amount: z.coerce
        .number({ invalid_type_error: "Jumlah harus berupa angka" })
        .int("Jumlah harus bilangan bulat")
        .positive("Jumlah harus lebih dari 0"),
    bank: z.enum(["bca", "bni", "bri", "mandiri", "cimb", "bsi"], {
        required_error: "Pilih bank tujuan",
    }),
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