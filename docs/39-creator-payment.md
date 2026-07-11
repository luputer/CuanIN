# Sequence Diagram - Bayar (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-39: **Bayar (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Payment Window)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant Midtrans as "Midtrans Snap API"
    participant Webhook as "Midtrans Webhook (route.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Note over Creator, DB: Skenario: Kreator membayar produk KREATOR LAIN yang dibelinya
    Client->>Server: Call purchases.createMidtransTransaction(purchaseId)
    Server->>Midtrans: Call createSnapTransaction(orderId, totalAmount, details)
    Midtrans-->>Server: Return Snap Token
    Server-->>Client: Return Snap Token
    Client->>Client: Tampilkan popup Midtrans Snap
    Creator->>Client: Selesaikan pembayaran
    
    %% Webhook
    Midtrans->>Webhook: HTTP POST Webhook (settlement callback)
    Webhook->>Webhook: Verifikasi signature SHA-512
    alt Signature valid
        Webhook->>DB: $transaction: Update Purchase (completed) & BalanceEntry (+saldo kreator lain)
        DB-->>Webhook: Transaksi DB sukses
        Webhook-->>Midtrans: Return HTTP 200 (OK)
    end

```

### Detail Langkah / Deskripsi Alur:
Kreator membayar tagihan atas produk kreator lain via Midtrans Snap, memicu pembaruan status transaksi & saldo kreator lain via webhook.
