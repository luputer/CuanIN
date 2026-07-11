# Sequence Diagram - Lihat Detail Katalog (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-37: **Lihat Detail Katalog (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Product Detail /catalog/[username]/[slug])"
    participant Server as "tRPC Catalog Router (catalog.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Klik pratinjau detail salah satu produk di katalog
    Client->>Server: Call catalog.getProductById({ slug, productSlug })
    Server->>DB: Query Product & FormField berdasarkan slug
    DB-->>Server: Return detail produk & form
    Server-->>Client: Return detail produk
    Client->>Creator: Tampilkan pratinjau halaman detail produk & form kuesioner

```

### Detail Langkah / Deskripsi Alur:
Kreator memeriksa pratinjau visual halaman detail dari produk tertentu miliknya.
