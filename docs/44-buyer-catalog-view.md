# Sequence Diagram - Lihat Katalog (Pembeli)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-44: **Lihat Katalog (Pembeli)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as "User / Pembeli (Buyer)"
    participant Client as "Next.js Client (Catalog Page /catalog/[username])"
    participant Server as "tRPC Catalog Router (catalog.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant Analytics as "tRPC Analytics Router (analytics.ts)"

    Buyer->>Client: Buka URL Katalog Kreator (/catalog/[username])
    Client->>Server: Call catalog.getBySlug(username)
    Server->>DB: Query Catalog & User berdasarkan username
    DB-->>Server: Return data
    Server->>DB: Query Product (status: published) milik Kreator
    DB-->>Server: Return list produk aktif
    Server-->>Client: Return data katalog & produk
    Client->>Client: Render halaman katalog (Banner, Bio, & Cards Produk)
    Client->>Buyer: Tampilkan halaman depan katalog toko kreator
    
    %% Track View
    Client->>Analytics: Call analytics.recordCatalogView({ catalogId })
    Analytics->>Analytics: Hash IP address pengunjung
    Analytics->>DB: Simpan record ke tabel CatalogView

```

### Detail Langkah / Deskripsi Alur:
Pembeli mengunjungi halaman katalog toko kreator untuk menelusuri produk yang dijual.
