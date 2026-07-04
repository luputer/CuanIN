import NextAuth from "next-auth";
import { authConfig } from "~/server/auth.config";
import { NextResponse } from "next/server";

const authMiddleware = NextAuth(authConfig).auth;

export default authMiddleware((request) => {
    const { nextUrl } = request;

    // 1. Filter request TRPC
    if (nextUrl.pathname.startsWith("/api/trpc")) {
        const isOtpApi =
            nextUrl.pathname.includes("auth.resendOtp") ||
            nextUrl.pathname.includes("auth.verifyOtp");

        if (isOtpApi) {
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
        return NextResponse.next();
    }
});

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
        // Masukkan route TRPC ke matcher agar terfilter di Edge
        "/api/trpc/:path*",
    ],
};
