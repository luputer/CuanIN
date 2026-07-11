# Sequence Diagram - Tambah Produk (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-18: **Tambah Produk (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Add Product Page)"
    participant S3Router as "tRPC S3 Router (s3.ts)"
    participant ProdRouter as "tRPC Products Router (products.ts)"
    participant R2 as "Cloudflare R2 Storage"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Unggah berkas produk & cover image
    Client->>S3Router: Call s3.getUploadPresignedUrl(key, fileType)
    S3Router-->>Client: Return Presigned PUT URL
    Client->>R2: HTTP PUT Upload File biner langsung ke R2
    R2-->>Client: Return HTTP 200 OK
    
    Creator->>Client: Lengkapi deskripsi & Klik Terbitkan
    Client->>ProdRouter: Call products.create(payload)
    ProdRouter->>ProdRouter: Generate slug unik
    ProdRouter->>DB: Insert record Product baru ke DB
    DB-->>ProdRouter: Simpan sukses
    ProdRouter-->>Client: Return created Product
    Client->>Creator: Tampilkan modal produk berhasil diterbitkan

```

### Detail Langkah / Deskripsi Alur:
Kreator menerbitkan produk baru dan mengunggah aset media langsung ke Cloudflare R2.
