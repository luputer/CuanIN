# Sequence Diagram - Lihat Detail Transaksi (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-11: **Lihat Detail Transaksi (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin CuanIN"
    participant Client as "Next.js Client (Transaction Detail Modal)"
    participant Server as "tRPC Admin Router (admin.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Klik rincian transaksi penarikan
    Client->>Server: Call admin.getWithdrawals(page, limit, search, status)
    Server->>DB: Query detail tabel Withdrawal & bank details
    DB-->>Server: Return data
    Server-->>Client: Return detail penarikan
    Client->>Admin: Tampilkan informasi detail rekening, status payout, & bank tujuan

```

### Detail Langkah / Deskripsi Alur:
Admin melihat bukti detail transfer, jumlah platform fee, & status transfer ke kreator.
