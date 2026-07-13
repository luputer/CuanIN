# Sequence Diagram - Akses Produk Lewat Email (Pembeli)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-48: **Akses Produk Lewat Email (Pembeli)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor User as "User"
    participant Inbox as "Email Client (Pembeli)"
    participant System as "SMTP Email Sender (Nodemailer)"

    Note over System, Inbox: Dipicu pasca Webhook Midtrans Sukses
    System->>Inbox: Kirim email akses produk (sendProductEmail) dengan link materi & portalUrl
    Inbox-->>User: User menerima email & mengklik tautan akses
    User->>Inbox: Klik tautan akses produk di dalam email
    Inbox->>User: Sistem mengarahkan User ke tautan akses produk
    User->>User: User mengakses produk

```

### Detail Langkah / Deskripsi Alur:

**User Akses Produk Lewat Email**
- **Aktor:** User
- **Kondisi Awal:** User sudah melakukan pembayaran dan menerima email.
- **Kondisi Akhir:** User berhasil mengakses produk melalui email.

**Skenario Utama:**
1. User buka email dan klik tautan akses.
2. Sistem mengarahkan User ke tautan akses produk.
3. User mengakses produk.
