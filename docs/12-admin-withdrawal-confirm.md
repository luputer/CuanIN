# Sequence Diagram - Konfirmasi Tarik Saldo (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-12: **Konfirmasi Tarik Saldo (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin"
    participant Client as "Next.js Client (Withdrawal Review)"
    participant Server as "tRPC Admin Router (admin.ts)"
    participant Xendit as "Xendit Payouts API"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Klik "Setujui/Tolak"
    Client->>Server: Call admin.adminWithdraw(withdrawalId)
    Server->>Xendit: Call createPayout(referenceId, amount, details)
    Xendit-->>Server: Return status: ACCEPTED / REJECTED
    Server->>DB: Update status Withdrawal ke ACCEPTED / REJECTED
    DB-->>Server: Update sukses
    Server-->>Client: Return status disetujui/ditolak
    Client->>Admin: Ubah badge status penarikan di daftar transaksi

```

### Detail Langkah / Deskripsi Alur:
Admin mengonfirmasi pengajuan penarikan dana kreator dan mengeksekusinya via payout gateway Xendit.
