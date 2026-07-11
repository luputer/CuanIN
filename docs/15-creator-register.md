# Sequence Diagram - Registrasi Akun (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-15: **Registrasi Akun (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Sign-Up Form)"
    participant Server as "tRPC Auth Router (auth.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant SMTP as "Resend Email Service"

    Creator->>Client: Lengkapi form registrasi & submit
    Client->>Server: Call auth.register(name, email, phone, password)
    Server->>DB: Cek ketersediaan email
    alt Email unik
        Server->>DB: Buat record User (role: CREATOR, emailVerified: null)
        Server->>Server: Generate OTP 6-Digit
        Server->>DB: Simpan OTP ke VerificationToken
        Server->>SMTP: Kirim email verifikasi OTP (sendVerificationEmail)
        Server-->>Client: Return { success: true }
        Client->>Creator: Redirect ke /verify-otp untuk verifikasi
    else Email terdaftar
        Server-->>Client: Error: Email sudah digunakan
        Client->>Creator: Tampilkan alert gagal registrasi
    end

```

### Detail Langkah / Deskripsi Alur:
Kreator baru mendaftarkan akun di platform CuanIN dan memicu proses verifikasi alamat email via OTP.
