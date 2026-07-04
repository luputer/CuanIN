import NextAuth from "next-auth";
import { authConfig } from "~/server/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@vercel/firewall";

const authMiddleware = NextAuth(authConfig).auth;

export default async function middleware(request: NextRequest, event: any) {
    const { nextUrl } = request;

    // 1. Filter request TRPC
    if (nextUrl.pathname.startsWith("/api/trpc")) {
        const isOtpApi =
            nextUrl.pathname.includes("auth.resendOtp") ||
            nextUrl.pathname.includes("auth.verifyOtp");

        if (isOtpApi) {
            // Apply Vercel Edge Rate Limiting to OTP endpoints
            try {
                const { rateLimited } = await checkRateLimit("otp_limit", {
                    request,
                });

                if (rateLimited) {
                    return new NextResponse(
                        JSON.stringify({
                            error: {
                                json: {
                                    message: "Batas percobaan terlampaui. Silakan coba beberapa saat lagi.",
                                    code: -32005,
                                    data: { code: "TOO_MANY_REQUESTS", httpStatus: 429 },
                                },
                            },
                        }),
                        {
                            status: 429,
                            headers: { "Content-Type": "application/json" },
                        }
                    );
                }
            } catch (error) {
                // Pastikan tidak crash di local development (karena SDK Vercel hanya aktif dideploy)
                console.error("Vercel WAF Rate Limit local warning:", error);
            }

            const otpCookie = request.cookies.get("otp_authorized_email");
            if (!otpCookie) {
                return new NextResponse(
                    JSON.stringify({
                        error: {
                            json: {
                                message: "Sesi verifikasi tidak ditemukan. Silakan masuk kembali.",
                                code: -32603,
                                data: { code: "FORBIDDEN", httpStatus: 403 },
                            },
                        },
                    }),
                    {
                        status: 403,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }
        }
        // Bypass NextAuth middleware sepenuhnya untuk rute TRPC agar session cookie tidak terganggu
        return NextResponse.next();
    }

    // 2. Jalankan NextAuth middleware untuk page creator/admin/sign-in
    return (authMiddleware as any)(request, event);
}

export const config = {
    // Matched paths for the middleware
    matcher: [
        "/dashboard/:path*",
        "/profile/:path*",
        "/webinar/:path*",
        "/kelas/:path*",
        "/produk-digital/:path*",
        "/peserta/:path*",
        "/pembayaran/:path*",
        "/setup/:path*",
        "/admin/:path*",
        "/sign-in",
        "/sign-up",
        "/",
        // HANYA saring API OTP, jangan saring semua API tRPC dashboard yang lain!
        "/api/trpc/auth.resendOtp",
        "/api/trpc/auth.verifyOtp",
    ],
};
