# Sequence Diagram - Kustomisasi Form (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-21: **Kustomisasi Form (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Form Builder Section)"
    participant Server as "tRPC FormFields Router (formFields.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    Creator->>Client: Tambah input/kuesioner kustom
    Client->>Server: Call formFields.save(productId, fields)
    Server->>DB: Delete old FormField records for productId
    Server->>DB: Create many new FormField records (label, type, required)
    DB-->>Server: Simpan sukses
    Server-->>Client: Return { success: true }
    Client->>Creator: Muncul icon ceklis berhasil tersimpan

```

### Detail Langkah / Deskripsi Alur:
Kreator mengatur kuesioner dinamis pada halaman checkout pembeli untuk mendapatkan informasi tambahan pembeli.
