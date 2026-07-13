# Sequence Diagram - Export Data Pembeli ke Excel (Kreator)

Diagram ini menjelaskan alur kasus penggunaan (use case) ke-24: **Export Data Pembeli ke Excel (Kreator)** pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Buyers Page)"
    participant Server as "tRPC Purchases Router (purchases.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"
    participant XLSX as "XLSX/ExcelJS Library"

    Creator->>Client: Klik tombol "Ekspor Excel"
    Client->>Server: Call purchases.exportBuyers({ productId })
    Server->>DB: Query data Purchase & FormAnswer pembeli
    DB-->>Server: Return data
    Server-->>Client: Return list data pembeli
    Client->>XLSX: Generate file buffer Excel (xlsx) di memori
    XLSX-->>Client: Buffer file xlsx siap
    Client->>Creator: Trigger download file "daftar_pembeli.xlsx"

```

### Detail Langkah / Deskripsi Alur:
Kreator mengekspor basis data pelanggan beserta jawaban kuesionernya ke spreadsheet Excel.
