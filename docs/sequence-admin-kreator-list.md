# Sequence Diagram - Lihat Daftar Kreator (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-2: **Lihat Daftar Kreator (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin CuanIN"
    participant Client as "Next.js Client (Creators List Page)"
    participant Server as "tRPC Admin Router (admin.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Buka halaman Daftar Kreator
    Client->>Server: Call admin.getCreatorsList(page, search)
    Server->>DB: Query semua User dengan role: CREATOR
    DB-->>Server: Return data kreator & count
    Server-->>Client: Return list kreator & pagination
    Client->>Admin: Rangkum dan tampilkan daftar kreator di tabel
```

### Detail Langkah / Deskripsi Alur:

Admin membuka basis data pengguna yang memiliki hak akses sebagai Kreator untuk diawasi.
