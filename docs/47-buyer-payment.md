# Sequence Diagram - Bayar (Pembeli)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-47: **Bayar (Pembeli)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as "User / Pembeli (Buyer)"
    participant Client as "Next.js Client (Payment Window)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant Midtrans as "Midtrans Snap API"
    participant Webhook as "Midtrans Webhook (route.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Client->>Server: Call purchases.createMidtransTransaction(purchaseId)
    Server->>Midtrans: Call createSnapTransaction(orderId, totalAmount, details)
    Midtrans-->>Server: Return Snap Token
    Server-->>Client: Return Snap Token
    Client->>Client: Tampilkan popup Midtrans Snap
    Buyer->>Client: Pilih metode & selesaikan pembayaran
    
    %% Webhook
    Midtrans->>Webhook: HTTP POST Webhook (settlement callback)
    Webhook->>Webhook: Verifikasi signature SHA-512
    alt Signature valid
        Webhook->>DB: $transaction: Update Purchase (completed), BalanceEntry (+saldo kreator), PortalAccess, & Notification
        DB-->>Webhook: Transaksi DB sukses
        Webhook-->>Midtrans: Return HTTP 200 (OK)
    end

```

### Detail Langkah / Deskripsi Alur:
Pembeli membayar tagihan via Midtrans Snap, memicu pembaruan status transaksi & saldo kreator via webhook.
