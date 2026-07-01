import type { NextAuthConfig, DefaultSession } from "next-auth";
import { type JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import { env } from "~/env";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            role: string;
            status: string;
            statusPayment: string;
            isProfileComplete: boolean;
            phone: string | null;
            hasCatalog: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        role: string;
        status: string;
        statusPayment: string;
        isProfileComplete: boolean;
        phone: string | null;
        hasCatalog: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        status: string;
        statusPayment: string;
        isProfileComplete: boolean;
        phone: string | null;
        hasCatalog: boolean;
    }
}

export const authConfig = {
    session: {
        strategy: "jwt",
    },
    secret: env.AUTH_SECRET,
    trustHost: true,
    pages: {
        signIn: "/sign-in",
    },
    providers: [
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({}),
    ],
    callbacks: {
        authorized({ auth, request }) {
            const { nextUrl } = request;
            const isLoggedIn = !!auth;
            const role = auth?.user?.role;
            const hasCatalog = auth?.user?.hasCatalog;

            const isPaymentSuccessPage = /^\/payment\/success/.test(nextUrl.pathname);

            // ── 0. Paksa logout HANYA sesi checkout (role USER) ──
            // CREATOR/ADMIN yang kebetulan login normal tetap dibiarkan
            if (
                isPaymentSuccessPage &&
                isLoggedIn &&
                role !== "CREATOR" &&
                role !== "ADMIN"
            ) {
                const res = NextResponse.next();
                res.cookies.delete("authjs.session-token");
                res.cookies.delete("__Secure-authjs.session-token");
                res.cookies.delete("checkout_google_sso");
                res.cookies.delete("checkout_origin");
                return res;
            }

            const isAuthPage =
                nextUrl.pathname.startsWith("/sign-in") ||
                nextUrl.pathname.startsWith("/sign-up") ||
                nextUrl.pathname === "/";

            const isAdminPage = nextUrl.pathname.startsWith("/admin");
            const isDashboardPage =
                nextUrl.pathname.startsWith("/dashboard") ||
                nextUrl.pathname.startsWith("/profile") ||
                nextUrl.pathname.startsWith("/webinar") ||
                nextUrl.pathname.startsWith("/kelas") ||
                nextUrl.pathname.startsWith("/produk-digital") ||
                nextUrl.pathname.startsWith("/peserta") ||
                nextUrl.pathname.startsWith("/pembayaran");

            // 1. Auth pages saat sudah login
            if (isAuthPage && isLoggedIn) {
                if (role === "ADMIN") {
                    return Response.redirect(new URL("/admin/dashboard", nextUrl));
                }
                if (role === "USER") {
                    return true; // Jangan di-redirect ke mana-mana
                }
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            // 2. Protect admin pages
            if (isAdminPage) {
                if (!isLoggedIn) return false;
                if (role !== "ADMIN") {
                    if (role === "USER") return false;
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
            }

            // 3. Admin ga boleh ke creator pages
            if (!isAuthPage && !isAdminPage && isLoggedIn && role === "ADMIN") {
                return Response.redirect(new URL("/admin/dashboard", nextUrl));
            }

            // 4. Belum login → block
            if (!isAuthPage && !isLoggedIn) {
                return false;
            }

            // 5. Belum punya catalog → wajib setup dulu
            if (isDashboardPage && isLoggedIn && role === "CREATOR" && hasCatalog === false) {
                return Response.redirect(new URL("/setup", nextUrl));
            }

            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id!;
                token.sub = user.id!;
                token.role = user.role;
                token.status = user.status;
                token.statusPayment = user.statusPayment;
                token.isProfileComplete = user.isProfileComplete;
                token.phone = user.phone;
                token.hasCatalog = user.hasCatalog; // ← dari authorize()
            }
            if (trigger === "update" && session) {
                return { ...token, ...(session as Partial<JWT>) };
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.status = token.status;
                session.user.statusPayment = token.statusPayment;
                session.user.isProfileComplete = token.isProfileComplete;
                session.user.phone = token.phone;
                session.user.hasCatalog = token.hasCatalog; // ← tambah
            }
            return session;
        },
    },
} satisfies NextAuthConfig;