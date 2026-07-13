# Sequence Diagram - Daftar / Checkout (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-38: **Daftar / Checkout (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Checkout Page)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    alt Kasus A: Kreator membeli produk MILIKNYA SENDIRI
        Creator->>Client: Lengkapi form checkout & klik Beli
        Client->>Server: Call purchases.create(productId, buyerEmail=email_sendiri)
        Server->>Server: Cek apakah email_pembeli === email_pemilik_produk
        Note over Server: Validasi gagal!
        Server-->>Client: Error: Tidak bisa membeli produk sendiri
        Client->>Creator: Tampilkan notifikasi "Tidak bisa membeli produk sendiri"
    else Kasus B: Kreator membeli produk KREATOR LAIN
        Creator->>Client: Lengkapi form checkout & klik Beli
        Client->>Server: Call purchases.create(productId, buyerEmail=email_kreator)
        Server->>Server: Cek apakah email_pembeli === email_pemilik_produk (berbeda)
        Server->>DB: Buat Purchase baru dengan status: PENDING
        DB-->>Server: Simpan sukses
        Server-->>Client: Return { status: 'pending', purchaseId }
        Client->>Creator: Lanjutkan ke pembayaran (Redirect ke Midtrans Snap)
    end

```

### Detail Langkah / Deskripsi Alur:
Kreator mensimulasikan pembelian produk (sistem melarang pembelian jika membeli produk sendiri, namun memperbolehkan jika membeli produk milik kreator lain).
