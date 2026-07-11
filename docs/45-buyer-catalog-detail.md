# Sequence Diagram - Lihat Detail Katalog (Pembeli)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-45: **Lihat Detail Katalog (Pembeli)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as "User / Pembeli (Buyer)"
    participant Client as "Next.js Client (Product Page)"
    participant Server as "tRPC Catalog Router (catalog.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant Analytics as "tRPC Analytics Router (analytics.ts)"

    Buyer->>Client: Klik salah satu produk di katalog
    Client->>Server: Call catalog.getProductById({ slug, productSlug })
    Server->>DB: Query Product, FormField, & Voucher aktif
    DB-->>Server: Return detail produk & kuesioner
    Server-->>Client: Return data detail produk
    Client->>Buyer: Tampilkan detail deskripsi, harga, & form formulir produk
    
    %% Track View
    Client->>Analytics: Call analytics.recordView({ productId })
    Analytics->>Analytics: Hash IP address pengunjung
    Analytics->>DB: Simpan record ke tabel ProductView

```

### Detail Langkah / Deskripsi Alur:
Pembeli membuka halaman detail produk untuk melihat rincian informasi dan mengisi form pesanan.
