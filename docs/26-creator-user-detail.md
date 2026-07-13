# Sequence Diagram - Lihat Detail User (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-26: **Lihat Detail User (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Customer Detail)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Klik salah satu profil user
    Client->>Server: Call purchases.getParticipantDetail({ purchaseId })
    Server->>DB: Query User Profile & riwayat transaksi historis
    DB-->>Server: Return data
    Server-->>Client: Return user detail & riwayat purchases
    Client->>Creator: Tampilkan profil lengkap & daftar riwayat pembelian user

```

### Detail Langkah / Deskripsi Alur:
Kreator melihat rincian riwayat transaksi yang pernah dilakukan oleh salah satu pembeli tertentu.
