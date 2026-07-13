# Sequence Diagram - Lihat Detail Pembeli (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-23: **Lihat Detail Pembeli (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Buyer Detail Modal)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Klik salah satu pembeli
    Client->>Server: Call purchases.getParticipantDetail({ purchaseId })
    Server->>DB: Query detail Purchase & FormAnswer (jawaban form kustom pembeli)
    DB-->>Server: Return data
    Server-->>Client: Return detail pembeli & jawaban form
    Client->>Creator: Tampilkan data lengkap pembeli & form kuesioner

```

### Detail Langkah / Deskripsi Alur:
Kreator memeriksa rincian jawaban form kustom & riwayat transaksi dari pembeli tertentu.
