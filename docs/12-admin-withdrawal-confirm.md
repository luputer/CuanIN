# Sequence Diagram - Konfirmasi Tarik Saldo (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-12: **Konfirmasi Tarik Saldo (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin"
    participant Client as "Next.js Client (Withdrawal Review)"
    participant Server as "tRPC Admin Router (admin.ts)"
    participant Midtrans as "Midtrans Payouts API"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Klik tombol "Setujui" atau "Tolak"
    Client->>Server: Call admin.adminWithdraw(withdrawalId, action)

    alt action = APPROVE (Setujui)
        Server->>Midtrans: Call createPayout(referenceId, amount, details)
        Midtrans-->>Server: Return payout status (ACCEPTED/FAILED)
        Server->>DB: Update status Withdrawal ke APPROVED
        DB-->>Server: Update sukses
        Server-->>Client: Return status: disetujui
    else action = REJECT (Tolak)
        Server->>DB: Update status Withdrawal ke REJECTED
        DB-->>Server: Update sukses
        Server-->>Client: Return status: ditolak
    end

    Client->>Admin: Ubah badge status penarikan di daftar transaksi

```

### Detail Langkah / Deskripsi Alur:
Admin meninjau pengajuan penarikan dana kreator dan memilih untuk menyetujui atau menolak. Jika disetujui, server memanggil Xendit Payouts API untuk mengeksekusi transfer dana. Jika ditolak, server langsung memperbarui status di database tanpa memanggil Xendit.
