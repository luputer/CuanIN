# Sequence Diagram - Akses Produk Lewat Email (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-40: **Akses Produk Lewat Email (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator (Creator)"
    participant Inbox as "Email Client (Kreator Copy)"
    participant System as "SMTP Email Sender"

    System->>Inbox: Kirim salinan notifikasi email pembelian produk (jika ada pembeli bertransaksi)
    Inbox-->>Creator: Kreator menerima email laporan produk terkirim ke pembeli

```

### Detail Langkah / Deskripsi Alur:
Kreator menerima salinan laporan notifikasi bahwa sistem telah mengirimkan akses produk ke pelanggan.
