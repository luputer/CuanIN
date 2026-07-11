# Sequence Diagram - Hapus Kreator (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-5: **Hapus Kreator (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin CuanIN"
    participant Client as "Next.js Client (Creators List Page)"
    participant Server as "tRPC Creators Router (creators.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Klik "Hapus" pada salah satu baris kreator
    Client->>Server: Call creators.delete(id)
    Server->>DB: Hapus record User di DB (Cascade delete data produk & saldo terikat)
    DB-->>Server: Hapus sukses
    Server-->>Client: Return { success: true }
    Client->>Admin: Tampilkan alert sukses & hilangkan dari tabel

```

### Detail Langkah / Deskripsi Alur:
Admin menghapus akun kreator secara permanen dari basis data CuanIN menggunakan creators.delete.
