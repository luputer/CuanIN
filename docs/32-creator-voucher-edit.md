# Sequence Diagram - Edit Voucher (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-32: **Edit Voucher (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Edit Voucher Page)"
    participant Server as "tRPC Vouchers Router (vouchers.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Klik Edit, ubah status data voucher, lalu klik simpan
    Client->>Server: Call vouchers.update(payload)
    Server->>DB: Update data Voucher di PostgreSQL
    DB-->>Server: Update sukses
    Server-->>Client: Return updated Voucher
    Client->>Creator: Tampilkan notifikasi voucher berhasil diperbarui

```

### Detail Langkah / Deskripsi Alur:

Kreator mengubah parameter status voucher (aktif/tidak aktif) atau menambah limit kuota voucher.
