import NextAuth, { type DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type Adapter } from "next-auth/adapters";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { env } from "~/env";
import { db } from "~/server/db";
import { authConfig } from "./auth.config";

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

const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(db) as Adapter,
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
                const parsed = credentialsSchema.safeParse(credentials);
                if (!parsed.success) return null;

                const { email, password } = parsed.data;

                const user = await db.user.findUnique({
                    where: { email },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        password: true,
                        role: true,
                        status: true,
                        statusPayment: true,
                        phoneNumber: true,
                    },
                });

                if (!user?.password) return null;

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) return null;

                return {
                    id: user.id,
                    name: user.name ?? "",
                    email: user.email,
                    image: user.image ?? "",
                    role: user.role,
                    status: user.status,
                    statusPayment: user.statusPayment,
                    isProfileComplete: !!user.phoneNumber,
                };
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        signIn: async ({ user, account }) => {
            if (account?.provider !== "google") return true;

            const dbUser = await db.user.findUnique({
                where: { email: user.email! },
                select: { phoneNumber: true },
            });

            if (!dbUser?.phoneNumber) {
                const params = new URLSearchParams({
                    name: user.name ?? "",
                    email: user.email ?? "",
                    fromGoogle: "1",
                });
                return `/sign-up?${params.toString()}`;
            }

            return true;
        },
        jwt: async ({ token, user, trigger }) => {
            if (user) {
                token.id = user.id ?? "";
                token.sub = user.id ?? "";
                token.role = user.role;
                token.status = user.status;
                token.statusPayment = user.statusPayment;
                token.isProfileComplete = user.isProfileComplete;
            }

            if (trigger === "update" && token.sub) {
                const dbUser = await db.user.findUnique({
                    where: { id: token.sub },
                    select: {
                        role: true,
                        status: true,
                        statusPayment: true,
                        phoneNumber: true,
                    },
                });

                if (dbUser) {
                    token.role = dbUser.role;
                    token.status = dbUser.status;
                    token.statusPayment = dbUser.statusPayment;
                    token.isProfileComplete = !!dbUser.phoneNumber;
                }
            }

            return token;
        },
    },
});

export const getServerAuthSession = () => auth();
