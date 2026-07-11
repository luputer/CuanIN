# Sequence Diagram - Akses Produk Lewat Portal (Pembeli)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-49: **Akses Produk Lewat Portal (Pembeli)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as "User / Pembeli (Buyer)"
    participant Client as "Next.js Client (/portal/[token])"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant R2 as "Cloudflare R2 Object Storage"

    Buyer->>Client: Klik tautan portal di email (/portal/login?token={portalToken})
    Client->>Server: Call purchases.loginWithPortalToken({ token })
    Server-->>Client: Return { email, accessToken }
    Client->>Server: Call purchases.getPurchaseHistoryByToken({ accessToken: accessToken, mode: 'produk' })
    Server->>DB: Query PortalAccess & Purchase terasosiasi (cek kedaluwarsa 30 hari)
    DB-->>Server: Return detail produk & links
    Server-->>Client: Return data lengkap
    Client->>Buyer: Tampilkan halaman portal akses berisi file & catatan kreator
    
    alt Pembeli klik "Download File"
        Buyer->>Client: Klik unduh berkas digital
        Client->>R2: HTTP GET unduh berkas menggunakan URL R2 publik
        R2-->>Buyer: Berkas tersimpan di lokal komputer
    end

```

### Detail Langkah / Deskripsi Alur:
Pembeli masuk ke portal akses terpusat untuk melihat tautan file dan mengunduhnya langsung dari R2.
