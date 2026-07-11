# Sequence Diagram - Daftar / Checkout (Pembeli)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-46: **Daftar / Checkout (Pembeli)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as "User / Pembeli (Buyer)"
    participant Client as "Next.js Client (Checkout Page)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Buyer->>Client: Lengkapi form checkout & voucher, klik "Beli Sekarang"
    Client->>Server: Call purchases.create(payload)
    Server->>DB: Cek kuota kapasitas produk (capacity)
    alt Kuota Tersedia
        alt Jika menggunakan voucher
            Server->>DB: Query Voucher & validasi limit / kedaluwarsa
            Server->>Server: Potong harga final (finalPrice)
        end
        Server->>DB: $transaction: Buat Purchase (PENDING), FormAnswer, & User (role: USER jika baru)
        DB-->>Server: Simpan sukses
        Server-->>Client: Return { status: 'pending', purchaseId }
        Client->>Buyer: Arahkan ke inisialisasi pembayaran
    else Kuota penuh
        Server-->>Client: Error: Kuota sudah penuh
        Client->>Buyer: Tampilkan pesan kuota habis
    end

```

### Detail Langkah / Deskripsi Alur:
Pembeli mengisi informasi nama, email, kuesioner kustom, voucher diskon, dan mengajukan checkout pesanan.
