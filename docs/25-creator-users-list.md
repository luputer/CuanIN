# Sequence Diagram - Lihat Daftar User (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-25: **Lihat Daftar User (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Customers Database)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Klik menu "User"
    Client->>Server: Call purchases.getAllParticipants({ page: 1 })
    Server->>DB: Query User yang pernah bertransaksi
    DB-->>Server: Return user data
    Server-->>Client: Return list user
    Client->>Creator: Tampilkan daftar seluruh user terdaftar di tokonya

```

### Detail Langkah / Deskripsi Alur:
Kreator melihat daftar seluruh identitas unik pembeli yang terdaftar di bawah catalog-nya.
