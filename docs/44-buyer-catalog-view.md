# Sequence Diagram - Lihat Katalog (Pembeli)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-44: **Lihat Katalog (Pembeli)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor User as "User"
    participant Client as "Next.js Client (Catalog Page /catalog/[username])"
    participant Server as "tRPC Catalog Router (catalog.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant Analytics as "tRPC Analytics Router (analytics.ts)"

    User->>Client: Buka URL toko Kreator (/catalog/[username])
    Client->>Server: Call catalog.getBySlug(username)
    Server->>DB: Query Catalog & User berdasarkan username
    DB-->>Server: Return data
    Server->>DB: Query Product (status: published) milik Kreator
    DB-->>Server: Return list produk aktif
    Server-->>Client: Return data toko & produk
    Client->>Client: Render halaman toko
    Client->>User: Tampilkan halaman toko kreator
    
    %% Track View
    Client->>Analytics: Call analytics.recordCatalogView({ catalogId })
    Analytics->>Analytics: Hash IP address pengunjung
    Analytics->>DB: Simpan record ke tabel CatalogView

```

### Detail Langkah / Deskripsi Alur:
User mengunjungi halaman katalog toko kreator untuk menelusuri produk yang dijual.
