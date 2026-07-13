# Sequence Diagram - Cetak Invoice (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-43: **Cetak Invoice (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (History / Portal Page)"
    participant jsPDF as "jsPDF Library (Client)"

    Creator->>Client: Klik "Cetak Invoice" pada salah satu riwayat pembelian
    Client->>Client: Ambil detail transaksi ter-cache
    Client->>jsPDF: new jsPDF() & generate layout invoice
    jsPDF-->>Client: File PDF siap
    Client->>Creator: Unduh file invoice PDF pembelian

```

### Detail Langkah / Deskripsi Alur:
Kreator mengunduh dokumen invoice digital berformat PDF atas transaksi pembelanjaan pribadinya.
