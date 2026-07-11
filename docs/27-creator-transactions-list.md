# Sequence Diagram - Lihat Daftar Transaksi (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-27: **Lihat Daftar Transaksi (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Transactions Page)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Membuka menu Riwayat Transaksi Toko (Pembayaran)
    Client->>Server: Call purchases.getAllForCreator({ page: 1 })
    Server->>DB: Query Purchase dengan filter produk milik Kreator
    DB-->>Server: Return data transaksi kreator
    Server-->>Client: Return list transaksi
    Client->>Creator: Tampilkan riwayat log penjualan di dashboard

```

### Detail Langkah / Deskripsi Alur:
Kreator memantau seluruh transaksi masuk atas pembelian produk-produknya.
