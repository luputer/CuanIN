# Sequence Diagram - Lihat Notifikasi (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-14: **Lihat Notifikasi (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin CuanIN"
    participant Client as "Next.js Client (Notification Panel)"
    participant Server as "tRPC Notification Router (notification.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Buka Panel Notifikasi Admin
    Client->>Server: Call notification.list()
    Server->>DB: Query Notification dengan filter userId = Admin & isRead = false
    DB-->>Server: Return list notifikasi
    Server-->>Client: Return unread notifications
    Client->>Admin: Tampilkan notifikasi pengajuan saldo masuk terbaru

```

### Detail Langkah / Deskripsi Alur:
Admin memantau pemberitahuan sistem terkait pengajuan penarikan dana baru yang diajukan oleh kreator.
