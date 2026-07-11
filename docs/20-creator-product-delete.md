# Sequence Diagram - Hapus Produk (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-20: **Hapus Produk (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Products List)"
    participant ProdRouter as "tRPC Products Router (products.ts)"
    participant S3Router as "tRPC S3 Router (s3.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant R2 as "Cloudflare R2 Storage"

    Creator->>Client: Klik "Hapus"
    Client->>ProdRouter: Call products.delete(id)
    ProdRouter->>DB: Query detail product (ambil key R2)
    DB-->>ProdRouter: Return data produk
    alt Ada File terlampir di R2
        ProdRouter->>S3Router: Call s3.deleteObject(key)
        S3Router->>R2: Delete object file
        R2-->>S3Router: Hapus sukses
    end
    ProdRouter->>DB: Hapus record Product di PostgreSQL
    DB-->>ProdRouter: Hapus sukses
    ProdRouter-->>Client: Return { success: true }
    Client->>Creator: Hapus baris produk dari tabel

```

### Detail Langkah / Deskripsi Alur:
Kreator menghapus produk secara permanen beserta semua aset filenya di Cloudflare R2.
