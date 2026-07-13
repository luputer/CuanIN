# Sequence Diagram - Lihat Riwayat Pembelian (Pembeli)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-50: **Lihat Riwayat Pembelian (Pembeli)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor User as "User"
    participant Client as "Next.js Client (History /riwayat)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant SMTP as "SMTP / Email Service"

    User->>Client: Pilih menu "Riwayat Pembelian"
    Client->>User: Arahkan ke halaman riwayat pembelian
    Client->>Server: Call purchases.getPurchaseHistory()
    Server->>DB: Query data riwayat pembelian
    DB-->>Server: Return daftar riwayat
    Server-->>Client: Return list riwayat pembelian
    Client->>User: Tampilkan seluruh riwayat pembelian
    User->>Client: Klik salah satu riwayat pembelian
    Client->>User: Tampilkan detail riwayat tersebut
```

### Detail Langkah / Deskripsi Alur:

**User Lihat Riwayat Pembelian**
- **Aktor:** User
- **Kondisi Awal:**
  1. User sudah melakukan pembelian.
  2. User sudah berada di halaman portal pelanggan.
- **Kondisi Akhir:** User berhasil melihat riwayat pembelian.

**Skenario Utama:**
1. User memilih "riwayat pembelian" pada menu.
2. Sistem mengarahkan User ke halaman riwayat pembelian.
3. User dapat melihat seluruh riwayat pembelian dan dapat melihat detailnya.
