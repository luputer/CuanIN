# Sequence Diagram - Lihat Riwayat Pembelian (Pembeli)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-50: **Lihat Riwayat Pembelian (Pembeli)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as "User / Pembeli (Buyer)"
    participant Client as "Next.js Client (History /riwayat)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant SMTP as "SMTP / Email Service"

    Buyer->>Client: Masukkan email untuk melihat riwayat belanja
    Client->>Server: Call purchases.sendPurchaseHistoryOtp({ email })
    Server->>DB: Cari user pembeli & pastikan ada
    Server->>Server: Generate OTP 6-Digit
    Server->>DB: Simpan OTP ke VerificationToken
    Server->>SMTP: Kirim OTP ke email pembeli
    Client->>Buyer: Tampilkan form input OTP
    
    Buyer->>Client: Input OTP dari email & submit
    Client->>Server: Call purchases.verifyPurchaseHistoryOtp({ email, otp })
    Server->>DB: Cocokkan OTP & terbitkan historyToken
    Client->>Server: Call purchases.getPurchaseHistoryByToken({ accessToken: historyToken, mode: 'riwayat' })
    Server->>DB: Query Purchase (status: completed) terkait email
    DB-->>Server: Return list pembelian historis
    Server-->>Client: Return list pembelian
    Client->>Buyer: Tampilkan semua daftar produk yang pernah dibeli

```

### Detail Langkah / Deskripsi Alur:
Pembeli melihat log riwayat seluruh transaksi pembelanjaan sukses miliknya diamankan verifikasi OTP.
