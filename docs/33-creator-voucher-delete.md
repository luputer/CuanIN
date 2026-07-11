# Sequence Diagram - Hapus Voucher (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-33: **Hapus Voucher (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Vouchers List)"
    participant Server as "tRPC Vouchers Router (vouchers.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Klik "Hapus" pada salah satu baris voucher
    Client->>Server: Call vouchers.delete({ id })
    Server->>DB: Hapus record Voucher di database
    DB-->>Server: Hapus sukses
    Server-->>Client: Return { success: true }
    Client->>Creator: Hilangkan baris voucher dari tabel

```

### Detail Langkah / Deskripsi Alur:
Kreator membatalkan / menghapus voucher diskon dari database agar tidak bisa dipakai pembeli.
