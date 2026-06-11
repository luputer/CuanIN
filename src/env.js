import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    BUCKET_ENDPOINT: z.string().url(),
    BUCKET_NAME: z.string(),
    BUCKET_REGION: z.string(),
    BUCKET_ACCESS_KEY: z.string(),
    BUCKET_SECRET_KEY: z.string(),
    BUCKET_PUBLIC_URL: z.string().url(),
    RESEND_API_KEY: z.string(),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
    SMTP_FROM: z.string().email(),
    XENDIT_SECRET_KEY: z.string(),
    XENDIT_WEBHOOK_TOKEN: z.string(),
    MIDTRANS_SERVER_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_XENDIT_PUBLIC_KEY: z.string(),
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string(),
    NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION: z.enum(["true", "false"]).default("false"), // ← fix
    NEXT_PUBLIC_BUCKET_PUBLIC_URL: z.string().url(),
  },
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    BUCKET_ENDPOINT: process.env.BUCKET_ENDPOINT,
    BUCKET_NAME: process.env.BUCKET_NAME,
    BUCKET_REGION: process.env.BUCKET_REGION,
    BUCKET_ACCESS_KEY: process.env.BUCKET_ACCESS_KEY,
    BUCKET_SECRET_KEY: process.env.BUCKET_SECRET_KEY,
    BUCKET_PUBLIC_URL: process.env.BUCKET_PUBLIC_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    XENDIT_SECRET_KEY: process.env.XENDIT_SECRET_KEY,
    XENDIT_WEBHOOK_TOKEN: process.env.XENDIT_WEBHOOK_TOKEN,
    MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_XENDIT_PUBLIC_KEY: process.env.NEXT_PUBLIC_XENDIT_PUBLIC_KEY,
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION, // ← fix
    NEXT_PUBLIC_BUCKET_PUBLIC_URL: process.env.NEXT_PUBLIC_BUCKET_PUBLIC_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});