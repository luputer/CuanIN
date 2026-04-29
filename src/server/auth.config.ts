import type { NextAuthConfig, DefaultSession } from "next-auth";
import { type JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "~/env";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            role: string;
            status: string;
            statusPayment: string;
            isProfileComplete: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        role: string;
        status: string;
        statusPayment: string;
        isProfileComplete: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        status: string;
        statusPayment: string;
        isProfileComplete: boolean;
    }
}



// Ini adalah konfigurasi yang aman untuk Edge Runtime (Middleware)
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
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth;
            const role = auth?.user?.role;

            const isAuthPage =
                nextUrl.pathname.startsWith("/sign-in") ||
                nextUrl.pathname.startsWith("/sign-up") ||
                nextUrl.pathname === "/";

            const isAdminPage = nextUrl.pathname.startsWith("/admin");

            // 1. If trying to access public auth/landing pages while logged in
            if (isAuthPage && isLoggedIn) {
                if (role === "ADMIN") {
                    return Response.redirect(new URL("/admin/dashboard", nextUrl));
                }
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            // 2. Protect Admin Pages
            if (isAdminPage) {
                if (!isLoggedIn) return false;
                if (role !== "ADMIN") {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
            }

            // 3. Protect Creator/User Pages (dashboard, webinar, etc)
            // If they are logged in as ADMIN, they shouldn't necessarily be blocked from these, 
            // but usually they go to admin dashboard.
            if (!isAuthPage && !isAdminPage && isLoggedIn && role === "ADMIN") {
                // Optional: Redirect admins away from creator pages to admin dashboard
                return Response.redirect(new URL("/admin/dashboard", nextUrl));
            }

            // 4. If trying to access any OTHER matched path while logged out, block access
            if (!isAuthPage && !isLoggedIn) {
                return false; // Automatically redirects to signIn page
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
            }
            if (trigger === "update" && session) {
                return { ...token, ...(session as Partial<JWT>) } as JWT;
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
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
