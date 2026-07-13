# Sequence Diagram - Lihat Dashboard (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-16: **Lihat Dashboard (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Creator Dashboard)"
    participant Server as "tRPC Analytics Router (analytics.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Klik menu "Dashboard"
    Client->>Server: Call analytics.getDashboardStats()
    Server->>DB: Query BalanceEntry, ProductView, & Purchase (status: completed)
    DB-->>Server: Return metrics
    Server-->>Client: Return dashboard metrics
    Client->>Creator: Tampilkan rangkuman statistik penjualan, saldo, & chart Recharts

```

### Detail Langkah / Deskripsi Alur:
Kreator membuka dasbor analitik penjualan untuk melihat grafik keuntungan dan jumlah pembeli.
