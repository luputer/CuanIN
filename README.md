# CuanIN

CuanIN is an all-in-one platform for Indonesian creators to sell digital products, host webinars, manage online classes, and handle payments — with a built-in admin panel. Built with the T3 Stack for high performance and scalability.

## Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org)
- **Authentication:** [NextAuth.js v5](https://next-auth.js.org)
- **ORM:** [Prisma](https://prisma.io)
- **Database:** PostgreSQL
- **API:** [tRPC](https://trpc.io)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com)
- **Validation:** [Zod](https://zod.dev)
- **Payment Gateway:** [Midtrans](https://midtrans.com)
- **Email:** [Nodemailer](https://nodemailer.com) + [Resend](https://resend.com) + [React Email](https://react.email)
- **Charts:** [Recharts](https://recharts.org)
- **Markdown:** [react-markdown](https://github.com/remarkjs/react-markdown) + [@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor)
- **Drag & Drop:** [@dnd-kit](https://dndkit.com)
- **OTP Input:** [input-otp](https://input-otp.vercel.app/)
- **Storage:** S3 Compatible Storage (AWS SDK)
- **Analytics:** [Vercel Analytics](https://vercel.com/analytics) + [Speed Insights](https://vercel.com/docs/speed-insights)

## Key Features

- **Authentication & Security:**
  - OTP email verification, magic link password reset, and Google SSO.
  - Brute-force protection, email normalization, and global session invalidation on password change.
- **Creator Dashboard:** Analytics with charts, revenue tracking, and content management.
- **Product Management:**
  - **Webinars:** Sell webinar tickets with integrated meeting links.
  - **Digital Products:** Sell files and digital assets with multi-link access.
  - **Online Classes (Kelas):** Create structured courses with materials, manage classes, and track participants.
- **Vouchers:** Creators can create and manage discount vouchers for their products.
- **Withdrawals:** Creators can request and track earnings withdrawals.
- **Participant Management:** Track and manage class/webinar participants.
- **Public Catalog:** Customizable creator profile pages at `/catalog/username` with product listings.
- **Custom Forms:** Creators can add custom form fields (short text, long text, dropdown, etc.) to collect data during checkout.
- **Payment Gateway:** Midtrans integration with webhook handling, payment success/failure flows, and transaction tracking.
- **Admin Panel:** Manage creators, products, transactions, and platform settings.
- **SEO:** Auto-generated `sitemap.xml` and `robots.txt`.

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- PostgreSQL Database
- S3 Compatible Storage (for image/file uploads)
- Midtrans account (for payment processing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/luputer/CuanIN.git
   cd CuanIN
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and populate the following variables:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/cuanin"
   DIRECT_URL="postgresql://user:password@localhost:5432/cuanin"

   # NextAuth
   AUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Email (SMTP)
   SMTP_HOST="smtp.example.com"
   SMTP_PORT=465
   SMTP_USER="your-email@example.com"
   SMTP_PASS="your-app-password"
   SMTP_FROM="noreply@example.com"

   # Storage (S3 Compatible)
   BUCKET_ENDPOINT="https://your-endpoint.com"
   BUCKET_NAME="cuanin-bucket"
   BUCKET_REGION="auto"
   BUCKET_ACCESS_KEY="your-access-key"
   BUCKET_SECRET_KEY="your-secret-key"
   BUCKET_PUBLIC_URL="https://pub-your-id.r2.dev"

   # Midtrans Payment Gateway
   MIDTRANS_SERVER_KEY="your-server-key"
   MIDTRANS_CLIENT_KEY="your-client-key"
   MIDTRANS_IS_PRODUCTION=false
   ```

4. Setup Database:
   ```bash
   npm run db:generate
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Folder Structure

- `src/app`: Next.js App Router pages.
  - `(admin)`: Admin panel — dashboard, creator management, product management, transactions.
  - `(creator)`: Creator dashboard — products, webinars, kelas, vouchers, payments, participants, profile.
  - `(catalog)`: Public catalog — creator profiles and product pages.
  - `(global-auth)`: Authentication pages (sign-in, sign-up, OTP, password reset).
  - `payment`: Payment result pages (success/failed).
  - `api`: API routes — auth callbacks, tRPC handler, Midtrans webhooks.
- `src/components`: Reusable UI components (Shadcn UI + Radix UI).
- `src/server`: Server-side logic — tRPC routers, database config, email service.
- `prisma`: Database schema and migrations.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (with Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run preview` | Build and start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run check` | Run lint + type check |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run format:write` | Format code with Prettier |
| `npm run format:check` | Check formatting with Prettier |
| `npm run db:generate` | Run Prisma migrations (dev) |
| `npm run db:migrate` | Deploy Prisma migrations |
| `npm run db:push` | Push schema changes without migration |
| `npm run db:studio` | Open Prisma Studio |

---

Built with love for Indonesian Creators.
