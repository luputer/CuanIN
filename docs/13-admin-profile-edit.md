# Sequence Diagram - Edit Profil (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-13: **Edit Profil (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin CuanIN"
    participant Client as "Next.js Client (Settings Page)"
    participant Server as "tRPC Profile Router (profile.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant NextAuth as "NextAuth Session Manager"

    Admin->>Client: Ubah data profil/password & Klik Simpan
    Client->>Server: Call profile.update(name, email, password)
    alt Password diubah
        Server->>Server: Enkripsi password via Bcrypt
    end
    Server->>DB: Update data Admin di tabel User
    DB-->>Server: Simpan sukses
    Server-->>Client: Return updated Admin data
    Client->>NextAuth: Trigger update()
    NextAuth-->>Client: Sesi terupdate
    Client->>Admin: Tampilkan notifikasi profil diperbarui

```

### Detail Langkah / Deskripsi Alur:
Admin mengupdate kredensial profil login dan password administratifnya.
