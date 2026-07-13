# Sequence Diagram - Lihat Daftar Transaksi (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-10: **Lihat Daftar Transaksi (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin"
    participant Client as "Next.js Client (Transactions List Page)"
    participant Server as "tRPC Admin Router (admin.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Klik menu "Transaksi"
    Client->>Server: Call admin.getWithdrawals(page, limit, search, status)
    Server->>DB: Query data tabel Withdrawal global beserta relasi User/Kreator
    DB-->>Server: Return data penarikan & pagination
    Server-->>Client: Return list penarikan
    Client->>Admin: Tampilkan daftar seluruh transaksi

```

### Detail Langkah / Deskripsi Alur:
Admin memantau riwayat pengajuan penarikan dana kreator secara global menggunakan admin.getWithdrawals.
