import NextAuth, { type DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { cookies } from "next/headers";

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

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(db),
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

        const { password } = parsed.data;
        const email = parsed.data.email.toLowerCase();

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
            emailVerified: true,
          },
        });

        if (!user?.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        if (!user.emailVerified) {
          throw new Error("Email belum diverifikasi. Silakan cek email Anda.");
        }

        return {
          id: user.id,
          name: user.name ?? "",
          email: user.email,
          image: user.image ?? "",
          role: user.role,
          status: user.status,
          statusPayment: user.statusPayment,
          isProfileComplete: !!user.phoneNumber,
          phone: user.phoneNumber,
          hasCatalog: false, // akan diisi di jwt callback
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    signIn: async ({ user, account }) => {
      if (account?.provider !== "google") return true;

      const cookieStore = await cookies();
      const isCheckoutSignIn =
        cookieStore.get("checkout_google_sso")?.value === "1";

      const dbUser = await db.user.findUnique({
        where: { email: user.email! },
        select: { id: true, phoneNumber: true, role: true },
      });

      if (isCheckoutSignIn) {
        if (!dbUser || dbUser.role === "USER") {
          user.role = "USER";
        }
        return true;
      }

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

        // Phone
        if (user.phone) {
          token.phone = user.phone;
        } else {
          const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: { phoneNumber: true },
          });
          token.phone = dbUser?.phoneNumber ?? null;
        }

        // Cek catalog saat pertama login
        const catalog = await db.catalog.findUnique({
          where: { userId: user.id },
          select: { slug: true },
        });
        token.hasCatalog = !!catalog;
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
          token.phone = dbUser.phoneNumber;
        }

        // Update hasCatalog dari DB saat trigger update
        const catalog = await db.catalog.findUnique({
          where: { userId: token.sub },
          select: { slug: true },
        });
        token.hasCatalog = !!catalog;
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
        session.user.hasCatalog = token.hasCatalog;
      }
      return session;
    },
  },
});

export const getServerAuthSession = () => auth();