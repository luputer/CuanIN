# Sequence Diagram - Lihat Detail Produk (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-9: **Lihat Detail Produk (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin CuanIN"
    participant Client as "Next.js Client (Product Admin Detail)"
    participant Server as "tRPC Products Router (products.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Klik rincian produk di tabel produk global
    Client->>Server: Call products.adminGetById(id)
    Server->>DB: Query record Product
    DB-->>Server: Return record detail
    Server-->>Client: Return detail data
    Client->>Admin: Tampilkan detail moderasinya

```

### Detail Langkah / Deskripsi Alur:
Admin membuka detail produk secara terpusat dari daftar produk global.
