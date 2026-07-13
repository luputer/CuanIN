# Sequence Diagram - Daftar / Checkout (Pembeli)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-46: **Daftar / Checkout (Pembeli)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor User as "User"
    participant Client as "Next.js Client (Checkout Page)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    User->>Client: Klik tombol beli pada halaman detail produk
    Client->>User: Arahkan ke halaman pendaftaran (checkout)
    User->>Client: Lengkapi form pendaftaran & voucher, klik "Beli"
    Client->>Server: Call purchases.create(payload)
    Server->>DB: Cek kuota kapasitas produk (capacity)
    alt Kuota Tersedia
        alt Jika menggunakan voucher
            Server->>DB: Query Voucher & validasi limit / kedaluwarsa
            Server->>Server: Potong harga final (finalPrice)
        end
        Server->>DB: $transaction: Buat Purchase (PENDING), FormAnswer, & User (role: USER jika baru)
        DB-->>Server: Simpan sukses
        Server-->>Client: Return purchaseId
        Client->>User: Arahkan ke halaman pembayaran
    else Kuota penuh
        Server-->>Client: Error: Kuota sudah penuh
        Client->>User: Tampilkan notifikasi kuota habis
    end

```

### Detail Langkah / Deskripsi Alur:
User mengisi informasi nama, email, kuesioner kustom, voucher diskon, dan mengajukan checkout pesanan.
