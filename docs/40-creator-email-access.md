# Sequence Diagram - Akses Produk Lewat Email (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-40: **Akses Produk Lewat Email (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Inbox as "Email Client (Kreator)"
    participant System as "SMTP Email Sender (Nodemailer)"

    Note over System, Inbox: Dipicu pasca Webhook Midtrans Sukses
    System->>Inbox: Kirim email akses produk (sendProductEmail) dengan link produk & portalUrl
    Inbox-->>Creator: Kreator menerima email & mengklik tautan akses
    Creator->>Inbox: Klik tautan akses produk di dalam email
    Inbox->>Creator: Sistem mengarahkan Kreator ke tautan akses produk
    Creator->>Creator: Kreator mengakses produk

```

### Detail Langkah / Deskripsi Alur:

**Kreator Akses Produk Lewat Email**
- **Aktor:** Kreator
- **Kondisi Awal:** Kreator sudah melakukan pembayaran dan menerima email.
- **Kondisi Akhir:** Kreator berhasil mengakses produk melalui email.

**Skenario Utama:**
1. Kreator buka email dan klik tautan akses.
2. Sistem mengarahkan Kreator ke tautan akses produk.
3. Kreator mengakses produk.
