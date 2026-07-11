# Sequence Diagram - Registrasi Akun & Verifikasi OTP (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-15: **Registrasi Akun & Verifikasi OTP (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Sign-Up / Verify Page)"
    participant Server as "tRPC Auth Router (auth.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant SMTP as "Resend Email Service"

    %% Bagian 1: Registrasi Akun
    Note over Creator, SMTP: Bagian 1: Registrasi & Pengiriman OTP
    Creator->>Client: Lengkapi form registrasi & submit
    Client->>Server: Call auth.register(name, email, phone, password)
    Server->>DB: Cek ketersediaan email
    alt Email unik
        Server->>DB: Buat record User (role: CREATOR, emailVerified: null)
        Server->>Server: Generate OTP 6-Digit & Set OTP Cookie (otp_authorized_email)
        Server->>DB: Simpan OTP ke VerificationToken
        Server->>SMTP: Kirim email verifikasi OTP (sendVerificationEmail)
        Server-->>Client: Return { success: true }
        Client->>Creator: Redirect ke /verify-otp?email={email}
    else Email terdaftar
        Server-->>Client: Error: Email sudah digunakan
        Client->>Creator: Tampilkan alert gagal registrasi
    end

    %% Bagian 2: Verifikasi OTP
    Note over Creator, SMTP: Bagian 2: Pengisian & Verifikasi OTP
    Creator->>Client: Masukkan 6 digit OTP & Klik Verifikasi
    Client->>Server: Call auth.verifyOtp({ email, otp })
    Server->>Server: Validasi kepemilikan OTP via Cookie (otp_authorized_email)
    Server->>DB: Query token OTP di VerificationToken
    alt OTP Valid & Belum Kedaluwarsa
        Server->>DB: Update emailVerified = new Date() pada User
        Server->>DB: Hapus token OTP dari tabel VerificationToken
        Server->>Server: Hapus cookie otp_authorized_email
        Server-->>Client: Return { success: true }
        Client->>Creator: Redirect ke /sign-in dengan pesan sukses verifikasi
    else OTP Salah / Expired
        Server-->>Client: Error: Kode OTP tidak valid / kedaluwarsa
        Client->>Creator: Tampilkan pesan error di form & sisa percobaan
    end
```

### Detail Langkah / Deskripsi Alur:

Kreator baru mendaftarkan akun di platform CuanIN, memverifikasi alamat email menggunakan kode OTP 6-digit, dan diarahkan ke halaman login setelah akun berhasil diaktifkan.
