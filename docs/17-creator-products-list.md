# Sequence Diagram - Lihat Daftar Produk (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-17: **Lihat Daftar Produk (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Products Page)"
    participant Server as "tRPC Products Router (products.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Buka tab "Produk"
    Client->>Server: Call products.getAll(userId = creatorId)
    Server->>DB: Query Product dengan filter userId = creatorId
    DB-->>Server: Return list produk kreator
    Server-->>Client: Return daftar produk
    Client->>Creator: Tampilkan daftar produk (Digital, Webinar, Kelas) di tabel

```

### Detail Langkah / Deskripsi Alur:
Kreator mengakses daftar seluruh produk yang diterbitkan beserta statusnya.
