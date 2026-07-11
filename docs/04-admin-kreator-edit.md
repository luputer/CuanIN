# Sequence Diagram - Edit Kreator (Admin)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-4: **Edit Kreator (Admin)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin CuanIN"
    participant Client as "Next.js Client (Edit Creator Page)"
    participant Server as "tRPC Creators Router (creators.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Admin->>Client: Edit info profil kreator & klik "Simpan"
    Client->>Server: Call creators.update(id, name, email, phoneNumber, password, image, banner, bio)
    Server->>DB: Update data User & Profile berdasarkan ID
    DB-->>Server: Update sukses
    Server-->>Client: Return updated Creator
    Client->>Admin: Tampilkan notifikasi edit sukses & reload data

```

### Detail Langkah / Deskripsi Alur:
Admin menyunting detail profil kreator atau menyetel parameter profil menggunakan creators.update.
