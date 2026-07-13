# Sequence Diagram - Edit Profil (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-34: **Edit Profil (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Profile Settings)"
    participant S3Router as "tRPC S3 Router (s3.ts)"
    participant ProfRouter as "tRPC Profile Router (profile.ts)"
    participant R2 as "Cloudflare R2 Storage"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant NextAuth as "NextAuth Session Provider"

    alt Ganti Banner Katalog / Foto
        Creator->>Client: Pilih berkas gambar banner baru
        Client->>S3Router: Call s3.getUploadPresignedUrl(key, fileType)
        S3Router-->>Client: Return Presigned URL
        Client->>R2: HTTP PUT Upload biner banner ke R2
        R2-->>Client: Upload sukses
    end

    Creator->>Client: Klik Edit Profil, ubah data, lalu klik "simpan"
    Client->>ProfRouter: Call profile.update(name, bio, banner, password)
    ProfRouter->>DB: Update tabel User & Profile
    DB-->>ProfRouter: Simpan sukses
    ProfRouter-->>Client: Return updated data
    Client->>NextAuth: Call update() (sync session)
    NextAuth-->>Client: Sesi terupdate
    Client->>Creator: Tampilkan toast profil berhasil diperbarui

```

### Detail Langkah / Deskripsi Alur:
Kreator mengubah deskripsi bio toko, banner toko, foto, dan informasi nama tampilan.
