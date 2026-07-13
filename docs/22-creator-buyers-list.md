# Sequence Diagram - Lihat Daftar Pembeli (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-22: **Lihat Daftar Pembeli (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Buyers Page)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Klik menu "Pembeli" pada salah satu produk
    Client->>Server: Call purchases.getAllParticipants({ page: 1, limit: 10 })
    Server->>DB: Query Purchase (status: completed) terkait produk milik Kreator
    DB-->>Server: Return data pembeli
    Server-->>Client: Return list pembeli
    Client->>Creator: Tampilkan daftar seluruh pembeli produknya

```

### Detail Langkah / Deskripsi Alur:
Kreator membuka database pelanggan yang telah menyelesaikan transaksi pembelian produknya.
