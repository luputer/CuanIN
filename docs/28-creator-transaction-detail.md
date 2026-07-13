# Sequence Diagram - Lihat Detail Transaksi (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-28: **Lihat Detail Transaksi (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Transaction Detail Modal)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Klik Lihat Detail pada salah satu transaksi
    Client->>Server: Call purchases.getById({ id })
    Server->>DB: Query detail Purchase & product details
    DB-->>Server: Return data
    Server-->>Client: Return detail transaksi
    Client->>Creator: Tampilkan informasi detail transaksi

```

### Detail Langkah / Deskripsi Alur:
Kreator memeriksa rincian potongan platform fee admin & nominal pendapatan bersih yang diterimanya.
