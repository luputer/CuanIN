# Sequence Diagram - Lihat Daftar Semua Produk (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-8: **Lihat Daftar Semua Produk (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin CuanIN"
    participant Client as "Next.js Client (All Products Page)"
    participant Server as "tRPC Products Router (products.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Buka Menu "Kelola Produk" secara global
    Client->>Server: Call products.adminGetAll(page, search)
    Server->>DB: Query tabel Product global tanpa batasan userId
    DB-->>Server: Return data produk & pagination
    Server-->>Client: Return list produk global
    Client->>Admin: Rangkum seluruh produk aktif dalam tabel moderasi

```

### Detail Langkah / Deskripsi Alur:
Admin memantau seluruh katalog produk digital, kelas, dan webinar di platform CuanIN secara global.
