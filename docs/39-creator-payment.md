# Sequence Diagram - Bayar (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-39: **Bayar (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Client as "Next.js Client (Checkout)"
    participant Server as "tRPC Purchases Router (purchases.ts)"

    Creator->>Client: Klik tombol bayar pada simulasi checkout
    Note over Creator, Server: Skenario ini gagal di tahap checkout karena pembelian produk sendiri dilarang
    Client-->>Creator: Transaksi dicegah (Error: Tidak bisa membeli produk sendiri)

```

### Detail Langkah / Deskripsi Alur:
Kreator dibatasi oleh sistem sehingga tidak dapat melangsungkan proses pembayaran atas produknya sendiri.
