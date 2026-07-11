# Sequence Diagram - Lihat Daftar Produk Kreator (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-6: **Lihat Daftar Produk Kreator (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin CuanIN"
    participant Client as "Next.js Client (Creator Products Page)"
    participant Server as "tRPC Creators Router (creators.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Klik "Lihat Produk" pada profil kreator
    Client->>Server: Call creators.getProducts(creatorId, type, page, limit, search)
    Server->>DB: Query tabel Product dengan filter userId = creatorId
    DB-->>Server: Return daftar produk kreator
    Server-->>Client: Return list produk
    Client->>Admin: Tampilkan katalog produk milik kreator tersebut

```

### Detail Langkah / Deskripsi Alur:
Admin memeriksa produk-produk apa saja yang dimiliki atau diterbitkan oleh salah satu kreator tertentu menggunakan creators.getProducts.
