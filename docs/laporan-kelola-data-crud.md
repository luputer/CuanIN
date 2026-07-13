# Sequence Diagram - Kelola Produk (Kreator)

Diagram ini menjelaskan alur gabungan operasi CRUD (Lihat Daftar, Tambah, Edit, dan Hapus) Produk oleh Kreator pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Product Page/Forms)"
    participant S3Router as "tRPC S3 Router (s3.ts)"
    participant ProdRouter as "tRPC Products Router (products.ts)"
    participant R2 as "Cloudflare R2 Storage"
    participant DB as "Database (PostgreSQL/Prisma)"

    alt Operasi: Lihat Daftar Produk (Read)
        Creator->>Client: Klik menu salah satu produk
        Client->>ProdRouter: Call products.getAll()
        ProdRouter->>DB: Query daftar produk milik Kreator
        DB-->>ProdRouter: Return daftar produk
        ProdRouter-->>Client: Return daftar produk
        Client->>Creator: Tampilkan daftar seluruh produk

    else Operasi: Tambah Produk (Create)
        Creator->>Client: Klik tombol "Tambah", lalu unggah berkas & gambar
        Client->>S3Router: Call s3.getUploadPresignedUrl(key, fileType)
        S3Router-->>Client: Return Presigned PUT URL
        Client->>R2: HTTP PUT Upload File biner langsung ke R2
        R2-->>Client: Return HTTP 200 OK
        Creator->>Client: Isi data produk, lalu klik "Terbitkan"
        Client->>ProdRouter: Call products.create(payload)
        ProdRouter->>ProdRouter: Generate slug unik
        ProdRouter->>DB: Insert record Product baru ke DB
        DB-->>ProdRouter: Simpan sukses
        ProdRouter-->>Client: Return created Product
        Client->>Creator: Tampilkan modal produk berhasil diterbitkan

    else Operasi: Edit Produk (Update)
        Creator->>Client: Klik tombol "Edit", ubah data, lalu klik "Simpan"
        Client->>ProdRouter: Call products.update(id, payload)
        ProdRouter->>DB: Update record Product di Database
        DB-->>ProdRouter: Update sukses
        ProdRouter-->>Client: Return updated Product
        Client->>Creator: Tampilkan notifikasi berhasil dan kembali ke daftar

    else Operasi: Hapus Produk (Delete)
        Creator->>Client: Klik tombol "Hapus" pada salah satu produk
        Client->>ProdRouter: Call products.delete(id)
        ProdRouter->>DB: Query detail product (ambil key R2)
        DB-->>ProdRouter: Return data produk
        alt Ada File terlampir di R2
            ProdRouter->>S3Router: Call s3.deleteObject(key)
            S3Router->>R2: Delete object file
            R2-->>S3Router: Hapus sukses
        end
        ProdRouter->>DB: Hapus record Product di PostgreSQL
        DB-->>ProdRouter: Hapus sukses
        ProdRouter-->>Client: Return { success: true }
        Client->>Creator: Hapus baris produk dari tabel
    end
```

---

# Sequence Diagram - Kelola Voucher (Kreator)

Diagram ini menjelaskan alur gabungan operasi CRUD (Lihat Daftar, Tambah, Edit, dan Hapus) Voucher oleh Kreator pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as "Kreator"
    participant Client as "Next.js Client (Voucher Page/Forms)"
    participant Server as "tRPC Vouchers Router (vouchers.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    alt Operasi: Lihat Daftar Voucher (Read)
        Creator->>Client: Klik menu "Voucher"
        Client->>Server: Call vouchers.getAll()
        Server->>DB: Query daftar voucher milik Kreator
        DB-->>Server: Return daftar voucher
        Server-->>Client: Return daftar voucher
        Client->>Creator: Tampilkan daftar seluruh voucher

    else Operasi: Tambah Voucher (Create)
        Creator->>Client: Klik tombol "Tambah", isi form, lalu klik "Simpan"
        Client->>Server: Call vouchers.create(payload)
        Server->>DB: Validasi kode voucher unik per akun Kreator
        alt Kode unik
            Server->>DB: Insert record Voucher baru ke DB
            DB-->>Server: Simpan sukses
            Server-->>Client: Return created Voucher
            Client->>Creator: Notifikasi voucher sukses dibuat & reload daftar
        else Kode duplikat
            Server-->>Client: Error: Voucher sudah digunakan
            Client->>Creator: Tampilkan pesan error
        end

    else Operasi: Edit Voucher (Update)
        Creator->>Client: Klik tombol "Edit", ubah data, lalu klik "Simpan"
        Client->>Server: Call vouchers.update(payload)
        Server->>DB: Update data Voucher di PostgreSQL
        DB-->>Server: Update sukses
        Server-->>Client: Return updated Voucher
        Client->>Creator: Tampilkan pesan voucher berhasil diperbarui

    else Operasi: Hapus Voucher (Delete)
        Creator->>Client: Klik tombol "Hapus" pada salah satu voucher
        Client->>Server: Call vouchers.delete({ id })
        Server->>DB: Hapus record Voucher di database
        DB-->>Server: Hapus sukses
        Server-->>Client: Return { success: true }
        Client->>Creator: Hilangkan baris voucher dari tabel
    end
```

---

# Sequence Diagram - Kelola Kreator (Admin)

Diagram ini menjelaskan alur gabungan operasi CRUD (Lihat Daftar, Tambah, Edit, dan Hapus) Data Kreator oleh Admin pada platform CuanIN.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as "Admin"
    participant Client as "Next.js Client (Admin Dashboard)"
    participant Server as "tRPC Creators Router (creators.ts)"
    participant DB as "Database (PostgreSQL/Prisma)"

    alt Operasi: Lihat Daftar Kreator (Read)
        Admin->>Client: Klik menu "Kreator"
        Client->>Server: Call creators.getAll()
        Server->>DB: Query daftar kreator
        DB-->>Server: Return daftar kreator
        Server-->>Client: Return daftar kreator
        Client->>Admin: Tampilkan daftar seluruh kreator

    else Operasi: Tambah Kreator (Create)
        Admin->>Client: Klik tombol "Tambah", isi form kreator, lalu klik "Simpan"
        Client->>Server: Call creators.create(name, email, phoneNumber, password, bio, banner)
        Server->>DB: Cek apakah email sudah terdaftar
        alt Email unik
            Server->>DB: Buat user baru (role: CREATOR) & Catalog & Profile
            DB-->>Server: Simpan sukses
            Server-->>Client: Return created Creator
            Client->>Admin: Tampilkan notifikasi sukses & reload list
        else Email duplikat
            Server-->>Client: Error: Email sudah terdaftar
            Client->>Admin: Tampilkan pesan error
        end

    else Operasi: Edit Kreator (Update)
        Admin->>Client: Klik tombol "Edit", ubah data kreator, lalu klik "Simpan"
        Client->>Server: Call creators.update(id, name, email, phoneNumber, password, image, banner, bio)
        Server->>DB: Update data User & Profile berdasarkan ID
        DB-->>Server: Update sukses
        Server-->>Client: Return updated Creator
        Client->>Admin: Tampilkan notifikasi edit sukses & reload data

    else Operasi: Hapus Kreator (Delete)
        Admin->>Client: Klik tombol "Hapus" pada salah satu kreator
        Client->>Server: Call creators.delete(id)
        Server->>DB: Hapus record User di DB (Cascade delete data produk & saldo terikat)
        DB-->>Server: Hapus sukses
        Server-->>Client: Return { success: true }
        Client->>Admin: Tampilkan alert sukses & hilangkan dari tabel
    end
```
