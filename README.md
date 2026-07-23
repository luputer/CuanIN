# CuanIN

CuanIN is an all-in-one platform for Indonesian creators to sell digital products, host webinars, manage online classes, and handle payments — featuring a built-in admin panel and a robust creator balance ledger. Built using the T3 Stack for high performance, scalability, and premium developer experience.

---

## Technical Documentation

This repository contains extensive technical documentation and system designs compiled for the Tugas Akhir (TA) report. Access the detailed guides and diagrams below:

- **[System Overview &amp; Architecture (Dokumentasi Sistem)](file:///home/luputer/Dokumen/TA/CuanIN/docs/README.md)**: Main Indonesian documentation covering the system architecture, ERD, and class diagrams.
- **[Multi-Tenant &amp; Role Management](file:///home/luputer/Dokumen/TA/CuanIN/docs/README-multi-tenant.md)**: Details on the multi-tenant architecture and access controls (CREATOR, USER, ADMIN).
- **[Payment &amp; Transaction Security](file:///home/luputer/Dokumen/TA/CuanIN/docs/keamanan-sistem-pembayaran.md)**: Explains the safety mechanisms for Midtrans integration and Xendit payout processing.
- **[System Flowcharts](file:///home/luputer/Dokumen/TA/CuanIN/docs/flowchart-sistem-penting.md)**: Core functional flowcharts for key platform paths (e.g. checkout, payment settlement, and payout).
- **[Use Case Diagrams](file:///home/luputer/Dokumen/TA/CuanIN/docs/use-case.md)**: Structural boundaries, users, and actions map.
- **[Access Portal Workflow](file:///home/luputer/Dokumen/TA/CuanIN/docs/portal-akses.md)**: Details the customer access portal (`/portal/[token]`) mechanism.
- **[System Improvements Log](file:///home/luputer/Dokumen/TA/CuanIN/README_PERBAIKAN.md)**: Logs recent security, performance, and UX fixes.

---

## Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org) with Turbopack (`next dev --turbo`)
- **Authentication:** [NextAuth.js v5](https://next-auth.js.org) (Credentials login & Google SSO provider)
- **ORM:** [Prisma](https://prisma.io) with custom Client placement (`prisma/generated/prisma`)
- **Database:** PostgreSQL (with connection pooling via Supabase pgBouncer)
- **API Router:** [tRPC v11](https://trpc.io) (fully type-safe APIs backed by TanStack React Query)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) + [PostCSS](https://postcss.org)
- **Real-time messaging:** [Pusher](https://pusher.com) for instant real-time notification alerts
- **Payment & Payout Gateways:**
  - **Midtrans:** Customer checkout integrations (webhooks, notifications, settlement callback tracking)
  - **Xendit:** Automated payouts & withdrawals system with developer-mode simulation
- **Document Generation:** [jsPDF](https://github.com/parallax/jsPDF) for client-side invoice PDF generation
- **Email Delivery:** [Nodemailer](https://nodemailer.com) + [Resend](https://resend.com) + [React Email](https://react.email) templates
- **Object Storage:** S3-Compatible storage (Cloudflare R2) for secure media assets and product files
- **Analytics:** [Vercel Analytics](https://vercel.com/analytics) + [Speed Insights](https://vercel.com/docs/speed-insights)

---

## Key Features

- **Authentication & Security:**
  - OTP email verification, magic link password reset, Google SSO.
  - Brute-force protection, email normalization, and global session invalidation on password change.
  - *New:* Automatic verification status checking with automatic OTP redirection for unverified logins.
- **Creator Dashboard & Analytics:**
  - Neo-brutalist custom dashboards with visitor analytics, OS/Browser tracking, conversion metrics, and visual charts (Recharts).
  - Balance & Ledger system tracking product purchases, platform fees (transaction-based processing), requested payouts, and payment completions.
- **Product Management:**
  - **Webinars:** Sell tickets, schedule events, distribute meeting links.
  - **Digital Products:** Upload files with Cloudflare R2 presigned URLs, offering single or multi-link product deliveries.
  - **Online Classes (Kelas):** Chapter organization, modules, materials upload, and participant progression tracking.
  - Supports drafts/unpublished status with success confirmation dialogs.
- **Custom Checkout Forms:** Add dynamic fields (short text, long text, dropdowns, checkboxes) to gather required customer info during purchase.
- **Discount Vouchers:** Persen (percentage) and Nominal (fixed value) discounts, selective product restriction, and usage limits per checkout or per user. Refactored settings to a dedicated metadata sidebar (`VoucherSidebarMetadata`) for modularity.
- **Toko / Storefront:** Customizable public profile page `/[username]` (referred to as **Toko**) with listing templates.
- **Portal Akses (Access Portal):** Optional buyer page (`/portal/[token]`) showing purchased items, accessible links, instructions, and invoice downloads. Enabled per product via the creator settings. (For details, see [portal-akses.md](file:///home/luputer/Dokumen/TA/CuanIN/docs/portal-akses.md)).
- **Admin Moderation Panel & Security:** Review earnings, moderate products, verify/decline payout requests (secured with OTP withdrawal verification), track user logs, and modify platform fee percentages.
- **Image Cropper & Upload UX:** Integrated standard Dialog components with premium neo-brutalist custom styling and direct thumbnail re-cropping UX.

---

## Folder Structure

- `src/app`: Next.js App Router directories:
  - `(admin)`: Management dashboard, user control, withdrawals overview.
  - `(creator)`: Creator-scoped workspaces (products, webinars, online classes, ledger payouts).
  - `(catalog)`: Customizable public profile page `/[username]` (referred to as **Toko**) with listing templates.
  - `(global-auth)`: Clean credential sign-in, signup, OTP, and password reset procedures.
  - `portal/[token]`: Dedicated single access portal for customers.
  - `api`: Endpoint integrations (Midtrans & Xendit webhook handlers, tRPC router client gateway).
- `src/components`: UI modular building blocks (Neo-brutalist custom components, Shadcn, Radix primitives).
- `src/lib`: Common helpers (invoice generation, payment setup, email routing, validation schemas).
- `src/server`: Backend business logic: tRPC routers, Prisma database connections, authorization configurations.
- `prisma`: Database schema layout, migration scripts, and generated client outputs.

---

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- PostgreSQL database
- S3-compatible cloud storage (e.g. Cloudflare R2)
- Pusher account (real-time notification setup)
- Midtrans & Xendit accounts (keys for testing or production)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/luputer/CuanIN.git
   cd CuanIN
   ```
2. **Install dependencies:**

   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the root directory based on the following complete configurations:

   ```env
   # Database Connections
   DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://user:password@host:5432/postgres"

   # NextAuth Secret & canonical links
   AUTH_SECRET="your-next-auth-secret-key"
   AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Google OAuth configuration
   GOOGLE_CLIENT_ID="your-google-oauth-client-id"
   GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

   # Cloudflare R2 / S3 Storage API Configuration
   BUCKET_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
   BUCKET_NAME="cuanin-bucket"
   BUCKET_REGION="auto"
   BUCKET_ACCESS_KEY="your-access-key"
   BUCKET_SECRET_KEY="your-secret-key"
   BUCKET_PUBLIC_URL="https://pub-your-id.r2.dev"
   NEXT_PUBLIC_BUCKET_PUBLIC_URL="https://pub-your-id.r2.dev"

   # Transactional Email Providers
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=465
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-gmail-app-password"
   SMTP_FROM="no-reply@cuanin.my.id"
   RESEND_API_KEY="re_your_resend_api_key"

   # Pusher Channels (Real-Time Service)
   PUSHER_APP_ID="your-pusher-app-id"
   PUSHER_KEY="your-pusher-key"
   PUSHER_SECRET="your-pusher-secret"
   PUSHER_CLUSTER="your-cluster-region"
   NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
   NEXT_PUBLIC_PUSHER_CLUSTER="your-cluster-region"

   # Xendit Payout Integration
   XENDIT_SECRET_KEY="xnd_development_your_payout_key"
   NEXT_PUBLIC_XENDIT_PUBLIC_KEY="xnd_public_development_your_public_key"
   XENDIT_WEBHOOK_TOKEN="your-callback-webhook-token"
   ENABLE_PAYOUT_SIMULATE=true

   # Midtrans Payments Integration
   MIDTRANS_SERVER_KEY="your-midtrans-server-key"
   NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="your-midtrans-client-key"
   NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
   ```
4. **Initialize Prisma Client & Database Migrations:**

   ```bash
   npm run db:generate
   ```
5. **Run the Development Server:**

   ```bash
   npm run dev
   ```

---

## Docker Deployment

To build and run the application locally inside Docker containers using Docker Compose:

1. **Verify your `.env` configuration:**
   Make sure you have populated the credentials correctly (specifically `POSTGRES_PASSWORD` if running the integrated database).
2. **Spin up the stack:**

   ```bash
   docker compose up --build
   ```

   This compiles the optimized Next.js standalone build using the `Dockerfile` and deploys the PostgreSQL schema updates automatically.

---

## Available Scripts

| Command                  | Description                                                                  |
| ------------------------ | ---------------------------------------------------------------------------- |
| `npm run dev`          | Starts dev server using Turbopack                                            |
| `npm run build`        | Builds the optimized Next.js application for production                      |
| `npm run start`        | Runs the compiled Next.js server locally                                     |
| `npm run preview`      | Builds and spins up the production build locally for verification            |
| `npm run lint`         | Runs ESLint formatting check                                                 |
| `npm run lint:fix`     | Automatically corrects ESLint rule violations                                |
| `npm run check`        | Checks both linting rules and TypeScript typings                             |
| `npm run typecheck`    | Validates types across code using TypeScript compiler                        |
| `npm run format:write` | Prettifies project code recursively                                          |
| `npm run format:check` | Verifies code conforms to Prettier rules                                     |
| `npm run db:generate`  | Creates schema migrations and compiles Prisma client models                  |
| `npm run db:migrate`   | Deploys accumulated migration files to production database                   |
| `npm run db:push`      | Fast updates target DB with current schemas without creating migration files |
| `npm run db:studio`    | Launches visual Prisma Studio interface                                      |

---

Built with ❤️ for Indonesian Creators.
