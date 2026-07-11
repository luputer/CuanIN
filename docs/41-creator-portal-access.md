# Sequence Diagram - Akses Produk Lewat Portal (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-41: **Akses Produk Lewat Portal (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (/portal/[token])"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Buka halaman portal pembeli menggunakan token milik salah satu pembeli
    Client->>Server: Call purchases.loginWithPortalToken({ token })
    Server-->>Client: Return { email, accessToken }
    Client->>Server: Call purchases.getPurchaseHistoryByToken({ accessToken, mode: 'produk' })
    Server->>DB: Query PortalAccess & Purchase
    DB-->>Server: Return data produk & file pembeli
    Server-->>Client: Return detail produk & links
    Client->>Creator: Tampilkan visualisasi portal unduhan pembeli

```

### Detail Langkah / Deskripsi Alur:
Kreator meninjau halaman portal akses pembeli untuk memastikan format tautan unduhan pembeli.
