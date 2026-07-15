# Sequence Diagram - Lihat Dashboard (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-1: **Lihat Dashboard (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin"
    participant Client as "Next.js Client (Admin Panel)"
    participant Server as "tRPC Analytics Router (analytics.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Klik menu "Dashboard"
    Client->>Server: Call analytics.adminGetStats()
    Server->>DB: Query total user (creators/buyers), total transaksi, platform fee, views, & data grafis mingguan/bulanan
    DB-->>Server: Return data analitik dashboard
    Server-->>Client: Return dashboard stats
    Client->>Admin: Tampilkan widget analitik global platform (Recharts charts)
```

### Detail Langkah / Deskripsi Alur:

Admin meminta data ringkasan analitik statistik global platform (total user, transaksi sukses, platform fee masuk, traffic views, kategori produk) menggunakan analytics.adminGetStats.
