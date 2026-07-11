# Sequence Diagram - Daftar / Checkout (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-38: **Daftar / Checkout (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Checkout Simulation)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Membeli produk sendiri untuk testing, isi data checkout
    Client->>Server: Call purchases.create(productId, buyerEmail, etc.)
    Server->>Server: Cegah pembelian jika email pembeli === email kreator pemilik
    Note over Server: Validasi: Tidak boleh beli produk milik sendiri!
    Server-->>Client: Error: Tidak bisa membeli produk sendiri
    Client->>Creator: Tampilkan larangan beli produk sendiri

```

### Detail Langkah / Deskripsi Alur:
Kreator mensimulasikan pembelian produk (sistem melarang pembelian jika email pembeli sama dengan email pemilik produk).
