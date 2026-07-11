# Sequence Diagram - Lihat Detail Produk Kreator (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-7: **Lihat Detail Produk Kreator (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin CuanIN"
    participant Client as "Next.js Client (Product Detail Page)"
    participant Server as "tRPC Products Router (products.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Buka salah satu detail produk kreator
    Client->>Server: Call products.adminGetById(productId)
    Server->>DB: Query Product detail & relasi kreator
    DB-->>Server: Return data produk
    Server-->>Client: Return detail produk
    Client->>Admin: Tampilkan detail deskripsi, harga, & aset dari produk kreator

```

### Detail Langkah / Deskripsi Alur:
Admin melihat spesifikasi detail dari sebuah produk digital/kelas/webinar milik kreator.
