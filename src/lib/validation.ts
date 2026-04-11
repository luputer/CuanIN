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