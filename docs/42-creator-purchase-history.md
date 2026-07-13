# Sequence Diagram - Lihat Riwayat Pembelian (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-42: **Lihat Riwayat Pembelian (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Purchase History /riwayat)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Pilih menu "Riwayat Pembelian"
    Client->>Creator: Arahkan ke halaman riwayat pembelian
    Client->>Server: Call purchases.getPurchaseHistory()
    Server->>DB: Query data riwayat pembelian
    DB-->>Server: Return daftar riwayat
    Server-->>Client: Return list riwayat pembelian
    Client->>Creator: Tampilkan seluruh riwayat pembelian
    Creator->>Client: Klik salah satu riwayat pembelian
    Client->>Creator: Tampilkan detail riwayat tersebut
```

### Detail Langkah / Deskripsi Alur:

**Kreator Lihat Riwayat Pembelian**
- **Aktor:** Kreator
- **Kondisi Awal:**
  1. Kreator sudah melakukan pembelian.
  2. Kreator sudah berada di halaman portal pelanggan.
- **Kondisi Akhir:** Kreator berhasil melihat riwayat pembelian.

**Skenario Utama:**
1. Kreator memilih "riwayat pembelian" pada menu.
2. Sistem mengarahkan Kreator ke halaman riwayat pembelian.
3. Kreator dapat melihat seluruh riwayat pembelian dan dapat melihat detailnya.
