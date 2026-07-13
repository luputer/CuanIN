# Sequence Diagram - Lihat Daftar Voucher (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-30: **Lihat Daftar Voucher (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Vouchers Page)"
    participant Server as "tRPC Vouchers Router (vouchers.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Klik menu "Voucher"
    Client->>Server: Call vouchers.getAll({ page: 1 })
    Server->>DB: Query Voucher dengan filter userId = creatorId
    DB-->>Server: Return list voucher
    Server-->>Client: Return daftar voucher
    Client->>Creator: Tampilkan daftar voucher

```

### Detail Langkah / Deskripsi Alur:
Kreator melihat daftar kode promo / kupon diskon yang telah dibuat untuk tokonya.
