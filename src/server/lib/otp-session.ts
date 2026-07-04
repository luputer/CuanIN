import { cookies } from "next/headers";
import { TRPCError } from "@trpc/server";

export const OTP_COOKIE = "otp_authorized_email";
export const OTP_TTL_MS = 10 * 60 * 1000; // 10 menit, samain sama expires OTP
export const RESEND_COOLDOWN_MS = 60 * 1000; // 60 detik, samain sama timer di UI

/** Cegah spam: cek kapan token terakhir dibuat (derive dari expires - TTL). */
export async function assertResendCooldown(
    db: { verificationToken: { findFirst: (args: any) => Promise<{ expires: Date } | null> } },
    email: string,
) {
    const existing = await db.verificationToken.findFirst({
        where: { identifier: email },
    });
    if (existing) {
        const createdAt = existing.expires.getTime() - OTP_TTL_MS;
        const elapsed = Date.now() - createdAt;
        if (elapsed < RESEND_COOLDOWN_MS) {
            const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
            throw new TRPCError({
                code: "TOO_MANY_REQUESTS",
                message: `Mohon tunggu ${wait} detik sebelum meminta kode baru.`,
            });
        }
    }
}

/**
 * Set cookie httpOnly = bukti kepemilikan flow OTP ini.
 * Panggil di SETIAP titik yang punya alasan sah untuk percaya request ini
 * benar-benar datang dari pemilik email tsb:
 *  - setelah register kirim OTP
 *  - setelah resendOtp kirim OTP
 *  - setelah Google OAuth berhasil konfirmasi kepemilikan email (signIn callback)
 *  - setelah password credentials terverifikasi benar (authorize(), sebelum throw unverified)
 */
export async function setOtpOwnership(email: string) {
    const cookieStore = await cookies();
    cookieStore.set(OTP_COOKIE, email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: OTP_TTL_MS / 1000,
        path: "/",
    });
}

/** Dicek di SERVER (bukan di client) -> ini yang nutup celah ganti email di URL. */
export async function assertOtpOwnership(email: string) {
    const cookieStore = await cookies();
    const authorizedEmail = cookieStore.get(OTP_COOKIE)?.value;
    if (authorizedEmail !== email) {
        throw new TRPCError({
            code: "FORBIDDEN",
            message: "Sesi verifikasi tidak valid. Silakan daftar ulang.",
        });
    }
}

export async function clearOtpOwnership() {
    const cookieStore = await cookies();
    cookieStore.delete(OTP_COOKIE);
}