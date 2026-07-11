# Sequence Diagram - Lihat Katalog (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-36: **Lihat Katalog (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Catalog Preview /catalog/[username])"
    participant Server as "tRPC Catalog Router (catalog.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Klik "Lihat Toko / Preview Katalog"
    Client->>Server: Call catalog.getBySlug(username)
    Server->>DB: Query detail Catalog & User
    DB-->>Server: Return data
    Server->>DB: Query Product (status: published) milik Kreator
    DB-->>Server: Return list produk
    Server-->>Client: Return data katalog & produk
    Client->>Creator: Tampilkan pratinjau halaman katalog publik kreator

```

### Detail Langkah / Deskripsi Alur:
Kreator melihat pratinjau (preview) halaman katalog penjualan miliknya di sisi publik.
