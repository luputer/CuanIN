-- CreateTable
CREATE TABLE "role" (
    "id_role" SERIAL NOT NULL,
    "nama_role" VARCHAR(40) NOT NULL,
    "guarded_name" VARCHAR(40) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "user" (
    "id_user" SERIAL NOT NULL,
    "id_role" INTEGER NOT NULL,
    "nama_user" VARCHAR(40) NOT NULL,
    "email" VARCHAR(40) NOT NULL,
    "password" VARCHAR(40) NOT NULL,
    "phone" VARCHAR(14) NOT NULL,
    "id_google" VARCHAR(30),
    "photo_url" VARCHAR(40),
    "email_verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "remember_token" VARCHAR(100),
    "status_user" VARCHAR(40) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "saldo" (
    "id_saldo" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "saldo" DECIMAL(65,30) NOT NULL,
    "rekening" VARCHAR(40) NOT NULL,

    CONSTRAINT "saldo_pkey" PRIMARY KEY ("id_saldo")
);

-- CreateTable
CREATE TABLE "produk" (
    "id_produk" SERIAL NOT NULL,
    "id_kategori" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "nama_produk" VARCHAR(40) NOT NULL,
    "deskripsi" TEXT,
    "thumbnail_url" VARCHAR(100),
    "tipe" VARCHAR(40) NOT NULL,
    "status" VARCHAR(40) NOT NULL,
    "catatan" TEXT,

    CONSTRAINT "produk_pkey" PRIMARY KEY ("id_produk")
);

-- CreateTable
CREATE TABLE "kategori" (
    "id_kategori" SERIAL NOT NULL,
    "nama_kategori" VARCHAR(40) NOT NULL,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id_kategori")
);

-- CreateTable
CREATE TABLE "webinar" (
    "id_produk" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jam_mulai" TIME NOT NULL,
    "jam_selesai" TIME NOT NULL,
    "kuota" DECIMAL(65,30) NOT NULL,
    "batas_daftar" TIMESTAMP(3) NOT NULL,
    "webinar_url" VARCHAR(40) NOT NULL,

    CONSTRAINT "webinar_pkey" PRIMARY KEY ("id_produk")
);

-- CreateTable
CREATE TABLE "produk_digital" (
    "id_produk" INTEGER NOT NULL,
    "produk_digital_url" VARCHAR(40) NOT NULL,

    CONSTRAINT "produk_digital_pkey" PRIMARY KEY ("id_produk")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id_produk" INTEGER NOT NULL,
    "durasi" TIME NOT NULL,
    "kelas_url" VARCHAR(40) NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id_produk")
);

-- CreateTable
CREATE TABLE "transaksi" (
    "id_transaksi" SERIAL NOT NULL,
    "id_metode" INTEGER NOT NULL,
    "id_produk" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "jumlah_transaksi" DECIMAL(65,30) NOT NULL,
    "status_transaksi" VARCHAR(40) NOT NULL,
    "snap_token" VARCHAR(40),
    "id_payment" INTEGER,
    "payment_type" VARCHAR(40),
    "payment_time" TIMESTAMP(3),
    "payment_detail" TEXT,

    CONSTRAINT "transaksi_pkey" PRIMARY KEY ("id_transaksi")
);

-- CreateTable
CREATE TABLE "metode_bayar" (
    "id_metode" SERIAL NOT NULL,
    "nama_metode" VARCHAR(40) NOT NULL,

    CONSTRAINT "metode_bayar_pkey" PRIMARY KEY ("id_metode")
);

-- CreateTable
CREATE TABLE "penarikan" (
    "id_penarikan" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "jumlah_penarikan" DECIMAL(65,30) NOT NULL,
    "nama_bank" VARCHAR(40) NOT NULL,
    "nomor_akun" DECIMAL(65,30) NOT NULL,
    "status_penarikan" VARCHAR(40) NOT NULL,

    CONSTRAINT "penarikan_pkey" PRIMARY KEY ("id_penarikan")
);

-- CreateTable
CREATE TABLE "catalog" (
    "id_catalog" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "link_catalog" VARCHAR(40) NOT NULL,

    CONSTRAINT "catalog_pkey" PRIMARY KEY ("id_catalog")
);

-- CreateTable
CREATE TABLE "detail_catalog" (
    "id_detail_catalog" SERIAL NOT NULL,
    "id_catalog" INTEGER NOT NULL,
    "id_produk" INTEGER NOT NULL,
    "link_detail_catalog" VARCHAR(40) NOT NULL,

    CONSTRAINT "detail_catalog_pkey" PRIMARY KEY ("id_detail_catalog")
);

-- CreateTable
CREATE TABLE "form_field" (
    "id_form_field" SERIAL NOT NULL,
    "id_produk" INTEGER NOT NULL,
    "field_judul" VARCHAR(100) NOT NULL,
    "field_type" VARCHAR(100) NOT NULL,
    "field_option" VARCHAR(100) NOT NULL,
    "is_required" INTEGER NOT NULL,
    "urutan" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "form_field_pkey" PRIMARY KEY ("id_form_field")
);

-- CreateTable
CREATE TABLE "form_answer" (
    "id_answer" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_form_field" INTEGER NOT NULL,
    "jawaban" TEXT NOT NULL,

    CONSTRAINT "form_answer_pkey" PRIMARY KEY ("id_answer")
);

-- CreateTable
CREATE TABLE "visitor_logs" (
    "id_visitor" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "ip_address" VARCHAR(40) NOT NULL,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_logs_pkey" PRIMARY KEY ("id_visitor")
);

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "role"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldo" ADD CONSTRAINT "saldo_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produk" ADD CONSTRAINT "produk_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produk" ADD CONSTRAINT "produk_id_kategori_fkey" FOREIGN KEY ("id_kategori") REFERENCES "kategori"("id_kategori") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webinar" ADD CONSTRAINT "webinar_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produk_digital" ADD CONSTRAINT "produk_digital_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_id_metode_fkey" FOREIGN KEY ("id_metode") REFERENCES "metode_bayar"("id_metode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penarikan" ADD CONSTRAINT "penarikan_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog" ADD CONSTRAINT "catalog_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_catalog" ADD CONSTRAINT "detail_catalog_id_catalog_fkey" FOREIGN KEY ("id_catalog") REFERENCES "catalog"("id_catalog") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_catalog" ADD CONSTRAINT "detail_catalog_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_field" ADD CONSTRAINT "form_field_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_answer" ADD CONSTRAINT "form_answer_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_logs" ADD CONSTRAINT "visitor_logs_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
