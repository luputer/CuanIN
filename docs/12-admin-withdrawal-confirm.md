# Sequence Diagram - Konfirmasi Tarik Saldo (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-12: **Konfirmasi Tarik Saldo (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin CuanIN"
    participant Client as "Next.js Client (Withdrawal Review)"
    participant Server as "tRPC Admin Router (admin.ts)"
    participant Xendit as "Xendit Payouts API"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Klik "Proses Payout / Setujui"
    Client->>Server: Call admin.adminWithdraw(withdrawalId)
    Server->>Xendit: Call createPayout(referenceId, amount, details)
    Xendit-->>Server: Return status: ACCEPTED / REQUESTED
    Server->>DB: Update status Withdrawal ke ACCEPTED / REQUESTED
    DB-->>Server: Update sukses
    Server-->>Client: Return status disetujui
    Client->>Admin: Ubah badge status penarikan di dashboard admin

```

### Detail Langkah / Deskripsi Alur:
Admin mengonfirmasi pengajuan penarikan dana kreator dan mengeksekusinya via payout gateway Xendit.
