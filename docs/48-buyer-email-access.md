# Sequence Diagram - Akses Produk Lewat Email (Pembeli)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-48: **Akses Produk Lewat Email (Pembeli)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as "User / Pembeli (Buyer)"
    participant Inbox as "Email Client (Pembeli)"
    participant System as "SMTP Email Sender (Nodemailer)"

    Note over System, Inbox: Dipicu pasca Webhook Midtrans Sukses
    System->>Inbox: Kirim email akses produk (sendProductEmail) dengan link materi & portalUrl
    Inbox-->>Buyer: Pembeli menerima email & mengklik link akses produk digital / webinar

```

### Detail Langkah / Deskripsi Alur:
Pembeli mendapatkan surat elektronik berisi tautan materi produk digital atau tiket webinar secara otomatis.
