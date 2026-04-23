import NextAuth from "next-auth";
import { authConfig } from "~/server/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
    // Matched paths for the middleware
    matcher: [
        "/dashboard/:path*", 
        "/webinar/:path*", 
        "/kelas/:path*", 
        "/produk-digital/:path*", 
        "/peserta/:path*", 
        "/pembayaran/:path*", 
        "/setup/:path*", 
        "/admin/:path*",
        "/sign-in", 
        "/sign-up", 
        "/"
    ],
};
