import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "~/env";

// Ini adalah konfigurasi yang aman untuk Edge Runtime (Middleware)
export const authConfig = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/login",
    },
    providers: [
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        // Kita biarkan kosong atau hanya definisikan tipenya di sini,
        // karena authorize() biasanya butuh DB/Bcrypt yang tidak aman di Edge.
        // Konfigurasi lengkapnya akan ada di auth.ts
        CredentialsProvider({}),
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isAuthPage = nextUrl.pathname.startsWith("/sign-in") || nextUrl.pathname === "/";

            if (isDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect ke login
            } else if (isAuthPage && isLoggedIn) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }
            return true;
        },
        jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.status = (user as any).status;
                token.statusPayment = (user as any).statusPayment;
                token.isProfileComplete = (user as any).isProfileComplete;
            }
            if (trigger === "update" && session) {
                return { ...token, ...session };
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
                (session.user as any).status = token.status;
                (session.user as any).statusPayment = token.statusPayment;
                (session.user as any).isProfileComplete = token.isProfileComplete;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
