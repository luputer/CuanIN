# Sequence Diagram - Lihat Riwayat Pembelian (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-42: **Lihat Riwayat Pembelian (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Purchase History /riwayat)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant SMTP as "SMTP / Email Service"

    Creator->>Client: Masukkan email untuk lacak riwayat belanja (sebagai buyer)
    Client->>Server: Call purchases.sendPurchaseHistoryOtp({ email })
    Server->>DB: Cari User pembeli
    Server->>Server: Generate OTP & kirim ke email
    Server->>SMTP: Kirim OTP (sendPurchaseHistoryOtpEmail)
    Client->>Creator: Minta input OTP
    Creator->>Client: Input OTP dari email
    Client->>Server: Call purchases.verifyPurchaseHistoryOtp({ email, otp })
    Server->>DB: Cocokkan & terbitkan historyToken
    Client->>Server: Call purchases.getPurchaseHistoryByToken({ accessToken: historyToken, mode: 'riwayat' })
    Server->>DB: Query Purchase (status: completed) terkait email
    DB-->>Server: Return daftar riwayat
    Server-->>Client: Return list riwayat pembelian
    Client->>Creator: Tampilkan produk yang pernah dibeli Kreator dari kreator lain

```

### Detail Langkah / Deskripsi Alur:
Kreator melacak riwayat transaksi pembelanjaan pribadinya dari kreator lain di platform CuanIN.
