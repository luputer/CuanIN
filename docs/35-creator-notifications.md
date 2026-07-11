# Sequence Diagram - Lihat Notifikasi (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-35: **Lihat Notifikasi (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Notification Dropdown)"
    participant Server as "tRPC Notification Router (notification.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Buka Panel Notifikasi
    Client->>Server: Call notification.list()
    Server->>DB: Query Notification (userId = creatorId, isRead = false)
    DB-->>Server: Return list notifikasi
    Server-->>Client: Return unread notifications
    Client->>Creator: Render list notifikasi (pembelian baru, transfer sukses)

```

### Detail Langkah / Deskripsi Alur:
Kreator memeriksa log notifikasi historis (pembayaran masuk / pencairan saldo) di dasbornya.
