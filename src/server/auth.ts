import NextAuth, { type DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type Adapter } from "next-auth/adapters";
import bcrypt from "bcryptjs";

import { env } from "~/env";
import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            role: string;
            status: string;
            statusPayment: string;
        } & DefaultSession["user"];
    }

    interface User {
        role: string;
        status: string;
        statusPayment: string;
    }
}

export const {
    handlers,
    auth,
    signIn,
    signOut,
} = NextAuth({
    adapter: PrismaAdapter(db) as Adapter,
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 7, // Sesi akan berlaku selama 7 hari (dalam detik)
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
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await db.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user?.password) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    name: user.name ?? "",
                    email: user.email,
                    image: user.image ?? "",
                    role: user.role,
                    status: user.status,
                    statusPayment: user.statusPayment,
                };
            },
        }),
    ],
    callbacks: {
        signIn: async ({ user, account }) => {
            // Only intercept Google sign-ins
            if (account?.provider === "google") {
                // Check if the user has completed their profile (phone number set)
                const dbUser = await db.user.findUnique({
                    where: { email: user.email! },
                    select: { phoneNumber: true },
                });

                // New Google user (no phone) → redirect to signup to complete profile
                if (!dbUser?.phoneNumber) {
                    const params = new URLSearchParams({
                        name: user.name ?? "",
                        email: user.email ?? "",
                        fromGoogle: "1",
                    });
                    return `/auth/signup?${params.toString()}`;
                }
            }
            return true;
        },
        jwt: ({ token, user }) => {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.status = user.status;
                token.statusPayment = user.statusPayment;
            }
            return token;
        },
        session: ({ session, token }) => {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.status = token.status as string;
                session.user.statusPayment = token.statusPayment as string;
            }
            return session;
        },
        redirect: ({ url, baseUrl }) => {
            if (url === "/" || url === baseUrl) {
                return `${baseUrl}/dashboard/creator`;
            }
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
    },
});

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 * In NextAuth v5, `auth()` handles this directly.
 */
export const getServerAuthSession = () => auth();
