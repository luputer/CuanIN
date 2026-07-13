# Sequence Diagram - Akses Produk Lewat Portal (Pembeli)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-49: **Akses Produk Lewat Portal (Pembeli)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor User as "User"
    participant Client as "Next.js Client (/portal/[token])"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    User->>Client: Klik tautan portal di email (/portal/login?token={portalToken})
    Client->>Server: Call purchases.loginWithPortalToken({ token })
    Server-->>Client: Return { email, accessToken }
    Client->>User: Arahkan ke halaman portal
    User->>Client: Klik menu "Produk Saya"
    Client->>Server: Call purchases.getPurchaseHistoryByToken({ accessToken, mode: 'produk' })
    Server->>DB: Query PortalAccess & Purchase
    DB-->>Server: Return data produk
    Server-->>Client: Return detail produk
    Client->>User: Tampilkan produk yang dapat diakses
```

### Detail Langkah / Deskripsi Alur:

**User Akses Produk Lewat Portal**
- **Aktor:** User
- **Kondisi Awal:**
  1. User sudah melakukan pembayaran dan menerima email.
  2. Portal akses diaktifkan oleh Kreator/pemilik produk.
  3. User berada di halaman toko (akses lewat tautan portal di email).
- **Kondisi Akhir:** User berhasil mengakses produk melalui portal.

**Skenario Utama:**
1. Jika lewat email/token, User dapat klik tautan portal pada email tersebut.
2. Setelahnya User akan diarahkan ke halaman portal.
3. User dapat mengakses produk melalui menu Produk Saya.
