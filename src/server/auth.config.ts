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
            const isDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isAuthPage =
                nextUrl.pathname.startsWith("/sign-in") ||
                nextUrl.pathname.startsWith("/sign-up") ||
                nextUrl.pathname === "/";

            if (isDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect ke login
            } else if (isAuthPage && isLoggedIn) {
                return Response.redirect(new URL("/dashboard", nextUrl));
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
