# Sequence Diagram - Edit Produk (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-19: **Edit Produk (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Edit Product Page)"
    participant ProdRouter as "tRPC Products Router (products.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Ubah data produk & klik simpan
    Client->>ProdRouter: Call products.update(id, payload)
    ProdRouter->>DB: Update record Product di Database
    DB-->>ProdRouter: Update sukses
    ProdRouter-->>Client: Return updated Product
    Client->>Creator: Tampilkan notifikasi edit berhasil & redirect ke daftar produk

```

### Detail Langkah / Deskripsi Alur:
Kreator menyunting informasi deskripsi, tautan materi, atau harga dari produk yang telah terbit.
