# Sequence Diagram - Akses Produk Lewat Portal (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-41: **Akses Produk Lewat Portal (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (/portal/[token])"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    alt Akses lewat Email
        Creator->>Client: Klik tautan portal pada email
        Client->>Server: Call purchases.loginWithPortalToken({ token })
    else Akses lewat Menu Akun
        Creator->>Client: Klik menu "Portal Pelanggan" pada bagian header
    else Akses lewat Toko
        Creator->>Client: Masuk dengan konfirmasi kode OTP atau langsung masuk jika sudah login
    end
    
    Server-->>Client: Autentikasi berhasil (Token/Sesi Valid)
    Client->>Creator: Arahkan ke halaman portal
    Creator->>Client: Klik menu "Produk Saya"
    Client->>Server: Call purchases.getPurchaseHistoryByToken({ accessToken, mode: 'produk' })
    Server->>DB: Query PortalAccess & Purchase
    DB-->>Server: Return data produk
    Server-->>Client: Return detail produk
    Client->>Creator: Tampilkan produk yang dapat diakses
```

### Detail Langkah / Deskripsi Alur:

**Kreator Akses Produk Lewat Portal**
- **Aktor:** Kreator
- **Kondisi Awal:**
  1. Kreator sudah melakukan pembayaran dan menerima email.
  2. Portal akses diaktifkan oleh Kreator/pemilik produk.
  3. Kreator berada di halaman toko (akses lewat tombol portal).
  4. Kreator sudah login dengan role sebagai Kreator (akses lewat menu di header).
- **Kondisi Akhir:** Kreator berhasil mengakses produk melalui portal.

**Skenario Utama:**
1. Jika lewat email/token, Kreator dapat klik tautan portal pada email tersebut.
2. Jika lewat toko, Kreator masuk dengan konfirmasi kode otp ataupun tidak sama sekali jika Kreator sudah login.
3. Jika lewat menu di akun, Kreator klik menu Portal Pelanggan pada bagian header.
4. Setelahnya Kreator akan diarahkan ke halaman portal.
5. Kreator dapat mengakses produk melalui menu Produk Saya.
