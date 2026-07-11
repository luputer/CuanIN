# Sequence Diagram - Tambah Voucher (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-31: **Tambah Voucher (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Voucher Form)"
    participant Server as "tRPC Vouchers Router (vouchers.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Isi form voucher & klik simpan
    Client->>Server: Call vouchers.create(payload)
    Server->>DB: Validasi kode voucher unik per akun Kreator
    alt Kode unik
        Server->>DB: Insert record Voucher baru ke DB
        DB-->>Server: Simpan sukses
        Server-->>Client: Return created Voucher
        Client->>Creator: Notifikasi voucher sukses dibuat & reload daftar
    else Kode duplikat
        Server-->>Client: Error: Voucher sudah digunakan
        Client->>Creator: Tampilkan pesan error
    end

```

### Detail Langkah / Deskripsi Alur:
Kreator menerbitkan kode voucher baru (nominal / persentase diskon) dengan batasan kuota & kedaluwarsa.
