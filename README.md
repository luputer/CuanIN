# CuanIN

CuanIN is an all-in-one platform for creators to easily sell digital products, host webinars, and manage online classes. Built with the T3 Stack for high performance and scalability.

## 🚀 Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org)
- **Authentication:** [NextAuth.js v5](https://next-auth.js.org)
- **ORM:** [Prisma](https://prisma.io)
- **Database:** PostgreSQL
- **API:** [tRPC](https://trpc.io)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com)
- **Validation:** [Zod](https://zod.dev)
- **Storage:** S3 Compatible Storage (AWS SDK)

## ✨ Key Features

- **Creator Dashboard:** Concise analytics and content management in one place.
- **Product Management:**
  - **Webinars:** Sell webinar tickets with integrated meeting links.
  - **Digital Products:** Sell files or digital assets.
  - **Online Classes:** Manage courses with structured materials.
- **Public Catalog:** Customizable creator profile pages to showcase all products (e.g., `/catalog/username`).
- **Custom Forms:** Creators can add custom form fields (Short text, Long text, Dropdown, etc.) to collect data during checkout.
- **Payment Tracking:** Monitor transaction statuses and purchase history.

## 🛠️ Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- PostgreSQL Database
- S3 Compatible Storage (for image/file uploads)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/username/cuanin.git
   cd cuanin
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
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

   # Storage (S3 Compatible)
   BUCKET_ENDPOINT="https://your-endpoint.com"
   BUCKET_NAME="cuanin-bucket"
   BUCKET_REGION="auto"
   BUCKET_ACCESS_KEY="your-access-key"
   BUCKET_SECRET_KEY="your-secret-key"
   BUCKET_PUBLIC_URL="https://pub-your-id.r2.dev"
   ```

4. Setup Database:
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## 📂 Folder Structure

- `src/app`: Next.js App Router.
  - `(creator)`: Creator dashboard and management pages.
  - `(catalog)`: Public catalog and product pages.
  - `(global-auth)`: Authentication pages (Sign-in/Sign-up).
- `src/components`: Reusable UI components (using Shadcn UI).
- `src/server`: Server-side logic, tRPC routers, and database configuration.
- `prisma`: Database schema and migrations.

## 📜 Available Scripts

- `npm run dev`: Starts the application in development mode.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production build.
- `npm run lint`: Runs ESLint to check for code issues.
- `npm run db:push`: Synchronizes the Prisma schema with the database.
- `npm run db:studio`: Opens a GUI to view and manage your database.

---

Built with ❤️ for Indonesian Creators.
