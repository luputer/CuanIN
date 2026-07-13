# Sequence Diagram - Lihat Katalog (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-36: **Lihat Katalog (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Catalog Preview /catalog/[username])"
    participant Server as "tRPC Catalog Router (catalog.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Klik "Kunjungi Toko" atau buka toko kreator lain
    Client->>Server: Call catalog.getBySlug(username)
    Server->>DB: Query detail toko & User
    DB-->>Server: Return data
    Server->>DB: Query Product (status: published) milik Kreator
    DB-->>Server: Return list produk
    Server-->>Client: Return data toko & produk
    Client->>Creator: Tampilkan halaman toko kreator

```

### Detail Langkah / Deskripsi Alur:
Kreator melihat pratinjau (preview) halaman katalog penjualan miliknya di sisi publik.
