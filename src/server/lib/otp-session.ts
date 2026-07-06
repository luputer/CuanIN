import { cookies } from "next/headers";
import { TRPCError } from "@trpc/server";

export const OTP_COOKIE = "otp_authorized_email";
export const OTP_TTL_MS = 10 * 60 * 1000; // 10 menit, samain sama expires OTP

export function getCooldownDuration(resendCount: number): number {
    if (resendCount <= 1) return 60 * 1000; // 60 detik
    if (resendCount === 2) return 5 * 60 * 1000; // 5 menit
    if (resendCount === 3) return 15 * 60 * 1000; // 15 menit
    return 60 * 60 * 1000; // 1 jam
}

/** Cegah spam: cek progressive cooldown di database */
export async function assertResendCooldown(db: any, email: string) {
    const limitIdentifier = `LIMIT:${email.toLowerCase()}`;
    const existing = await db.verificationToken.findFirst({
        where: { identifier: limitIdentifier },
    });
    if (existing) {
        const now = Date.now();
        const expiresTime = existing.expires.getTime();
        if (now < expiresTime) {
            const waitMs = expiresTime - now;
            const waitSec = Math.ceil(waitMs / 1000);
            let waitMessage = "";
            if (waitSec >= 3600) {
                waitMessage = `${Math.ceil(waitSec / 3600)} jam`;
            } else if (waitSec >= 60) {
                waitMessage = `${Math.ceil(waitSec / 60)} menit`;
            } else {
                waitMessage = `${waitSec} detik`;
            }
            throw new TRPCError({
                code: "TOO_MANY_REQUESTS",
                message: `Batas pengiriman OTP tercapai. Silakan coba lagi dalam ${waitMessage}.`,
            });
        }
    }
}

/** Increment resend count dan set cooldown baru */
export async function incrementResendCount(db: any, email: string) {
    const limitIdentifier = `LIMIT:${email.toLowerCase()}`;
    const existing = await db.verificationToken.findFirst({
        where: { identifier: limitIdentifier },
    });
    const now = Date.now();
    if (existing) {
        const timeSinceExpiry = now - existing.expires.getTime();
        let newCount = existing.attempts + 1;
        // Jika sudah lewat 24 jam sejak cooldown berakhir, reset hitungan
        if (timeSinceExpiry > 24 * 60 * 60 * 1000) {
            newCount = 1;
        }
        const cooldown = getCooldownDuration(newCount);
        await db.verificationToken.update({
            where: { token: limitIdentifier },
            data: {
                attempts: newCount,
                expires: new Date(now + cooldown),
            },
        });
    } else {
        const cooldown = getCooldownDuration(1);
        await db.verificationToken.create({
            data: {
                identifier: limitIdentifier,
                token: limitIdentifier,
                expires: new Date(now + cooldown),
                attempts: 1,
            },
        });
    }
}

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