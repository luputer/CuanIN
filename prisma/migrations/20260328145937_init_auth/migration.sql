/*
  Warnings:

  - You are about to drop the `catalog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `detail_catalog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `form_answer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `form_field` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kategori` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kelas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `metode_bayar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `penarikan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `produk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `produk_digital` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `saldo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transaksi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `visitor_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `webinar` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('WEBINAR', 'DIGITAL_PRODUCT', 'KELAS_ONLINE');

-- DropForeignKey
ALTER TABLE "catalog" DROP CONSTRAINT "catalog_id_user_fkey";

-- DropForeignKey
ALTER TABLE "detail_catalog" DROP CONSTRAINT "detail_catalog_id_catalog_fkey";

-- DropForeignKey
ALTER TABLE "detail_catalog" DROP CONSTRAINT "detail_catalog_id_produk_fkey";

-- DropForeignKey
ALTER TABLE "form_answer" DROP CONSTRAINT "form_answer_id_user_fkey";

-- DropForeignKey
ALTER TABLE "form_field" DROP CONSTRAINT "form_field_id_produk_fkey";

-- DropForeignKey
ALTER TABLE "penarikan" DROP CONSTRAINT "penarikan_id_user_fkey";

-- DropForeignKey
ALTER TABLE "produk" DROP CONSTRAINT "produk_id_kategori_fkey";

-- DropForeignKey
ALTER TABLE "produk" DROP CONSTRAINT "produk_id_user_fkey";

-- DropForeignKey
ALTER TABLE "produk_digital" DROP CONSTRAINT "produk_digital_id_produk_fkey";

-- DropForeignKey
ALTER TABLE "saldo" DROP CONSTRAINT "saldo_id_user_fkey";

-- DropForeignKey
ALTER TABLE "transaksi" DROP CONSTRAINT "transaksi_id_metode_fkey";

-- DropForeignKey
ALTER TABLE "transaksi" DROP CONSTRAINT "transaksi_id_produk_fkey";

-- DropForeignKey
ALTER TABLE "transaksi" DROP CONSTRAINT "transaksi_id_user_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_id_role_fkey";

-- DropForeignKey
ALTER TABLE "visitor_logs" DROP CONSTRAINT "visitor_logs_id_user_fkey";

-- DropForeignKey
ALTER TABLE "webinar" DROP CONSTRAINT "webinar_id_produk_fkey";

-- DropTable
DROP TABLE "catalog";

-- DropTable
DROP TABLE "detail_catalog";

-- DropTable
DROP TABLE "form_answer";

-- DropTable
DROP TABLE "form_field";

-- DropTable
DROP TABLE "kategori";

-- DropTable
DROP TABLE "kelas";

-- DropTable
DROP TABLE "metode_bayar";

-- DropTable
DROP TABLE "penarikan";

-- DropTable
DROP TABLE "produk";

-- DropTable
DROP TABLE "produk_digital";

-- DropTable
DROP TABLE "role";

-- DropTable
DROP TABLE "saldo";

-- DropTable
DROP TABLE "transaksi";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "visitor_logs";

-- DropTable
DROP TABLE "webinar";

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "bio" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "type" "ProductType" NOT NULL DEFAULT 'WEBINAR',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'published',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified_at" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'creator',
    "status" TEXT NOT NULL DEFAULT 'active',
    "statusPayment" TEXT NOT NULL DEFAULT 'free',
    "google_id" TEXT,
    "phone_number" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Catalog" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Catalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_name_idx" ON "Post"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Catalog_slug_key" ON "Catalog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Catalog_userId_key" ON "Catalog"("userId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Catalog" ADD CONSTRAINT "Catalog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
