# Sequence Diagram - Tarik Saldo (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-29: **Tarik Saldo (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Balance Page)"
    participant Server as "tRPC Withdrawals Router (withdrawals.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant SMTP as "SMTP / Email Service"

    Creator->>Client: Klik tombol "Tarik Saldo"
    Client->>Creator: Tampilkan form tarik saldo (modal)
    Creator->>Client: Isi data penarikan, klik "Konfirmasi"
    Client->>Server: Call withdrawals.create(amount, bank, accountNumber, accountHolderName)
    Server->>DB: Hitung sisa saldo aktif Kreator di ledger DB (getCreatorBalance)
    alt Saldo cukup
        Server->>DB: $transaction: Buat Withdrawal (PENDING) & BalanceEntry debit (-)
        DB-->>Server: Transaksi DB sukses
        Server->>SMTP: Kirim email notifikasi pengajuan pending (sendWithdrawalPendingEmail)
        Server-->>Client: Return objek Withdrawal
        Client->>Creator: Tampilkan pemberitahuan tarik saldo sedang diproses
    else Saldo kurang
        Server-->>Client: Error: Saldo tidak cukup
        Client->>Creator: Tampilkan notifikasi gagal
    end

```

### Detail Langkah / Deskripsi Alur:
Kreator mengajukan pencairan pendapatan ke rekening bank, memicu pendebitan saldo di ledger DB.
