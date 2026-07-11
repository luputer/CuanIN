# Sequence Diagram - Cetak Invoice (Pembeli)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-51: **Cetak Invoice (Pembeli)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as "User / Pembeli (Buyer)"
    participant Client as "Next.js Client (Portal Page / History)"
    participant jsPDF as "jsPDF Library (Client)"

    Buyer->>Client: Klik tombol "Cetak Invoice / Unduh PDF"
    Client->>Client: Ambil detail transaksi ter-cache (ID, Item, Harga, Metode Bayar)
    Client->>jsPDF: new jsPDF() & gambar desain layout invoice resmi CuanIN
    jsPDF-->>Client: Buffer file PDF siap
    Client->>Buyer: Unduh invoice PDF resmi ke folder download lokal

```

### Detail Langkah / Deskripsi Alur:
Pembeli mencetak / mengunduh dokumen invoice digital berformat PDF sebagai tanda bukti lunas.
