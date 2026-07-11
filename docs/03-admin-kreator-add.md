# Sequence Diagram - Tambah Kreator (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-3: **Tambah Kreator (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin CuanIN"
    participant Client as "Next.js Client (Creator Form)"
    participant Server as "tRPC Creators Router (creators.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Isi form kreator baru & klik "Simpan"
    Client->>Server: Call creators.create(name, email, phoneNumber, password, bio, banner)
    Server->>DB: Cek apakah email sudah terdaftar
    alt Email unik
        Server->>DB: Buat user baru (role: CREATOR) & Catalog & Profile
        DB-->>Server: Simpan sukses
        Server-->>Client: Return created Creator
        Client->>Admin: Tampilkan notifikasi sukses & reload list
    else Email duplikat
        Server-->>Client: Error: Email sudah terdaftar
        Client->>Admin: Tampilkan pesan error
    end

```

### Detail Langkah / Deskripsi Alur:
Admin mendaftarkan akun kreator baru secara langsung ke database CuanIN menggunakan creators.create.
