# Portal Akses — Dokumentasi Fitur

## Ringkasan

**Portal Akses** memberikan setiap pembeli halaman portal unik (unique URL) untuk mengakses produk digital yang sudah dibeli. Portal menampilkan semua link akses dan catatan produk dalam satu halaman.

Kreator mengaktifkan fitur ini via toggle **"Portal Akses"** di bagian **Pengaturan Tambahan** pada form produk.

---

## Cara Kerja

```
				Buyer bayar → Webhook (Xendit/Midtrans)
  ├─ Purchase status → completed
  ├─ Generate portalToken (nanoid 16 char)
  ├─ Simpan portalToken ke Purchase
  ├─ Kirim email:
  │   ├─ Link langsung (product.link)
  │   └─ Link portal (/portal/{token}) ← jika portalEnabled
  └─ Balance entry dibuat

Buyer buka /portal/{token}
  ├─ Fetch purchase by portalToken
  ├─ Tampilkan: nama produk, links, catatan
  └─ Tombol CTA → product.link
```

---

## Database Schema

### Product

| Field             | Type    | Default   | Keterangan               |
| ----------------- | ------- | --------- | ------------------------ |
| `portalEnabled` | Boolean | `false` | Toggle portal per produk |

### 
    Purchase

| Field           | Type    | Constraint  | Keterangan                                |
| --------------- | ------- | ----------- | ----------------------------------------- |
| `portalToken` | String? | `@unique` | Token unik per pembelian (16 char nanoid) |

---

## File yang Diubah

| File                                                 | Perubahan                                                             |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| `prisma/schema.prisma`                             | Tambah `portalEnabled` di Product, `portalToken` di Purchase      |
| `src/lib/validation.ts`                            | Tambah `enablePortal` di semua schema (digital, kelas, webinar)     |
| `src/components/creator/product-form-sections.tsx` | Toggle "Portal Akses" di Pengaturan Tambahan                          |
| `src/hooks/use-create-produk-digital.ts`           | `enablePortal` di defaultValues + mutation                          |
| `src/hooks/use-produk-digital-kelas.ts`            | `enablePortal` di defaultValues, edit reset, create/update mutation |
| `src/hooks/use-create-kelas.ts`                    | `enablePortal` di defaultValues + mutation                          |
| `src/hooks/use-edit-kelas.ts`                      | `enablePortal` di defaultValues, edit reset, update mutation        |
| `src/hooks/use-create-webinar.ts`                  | `enablePortal` di defaultValues + mutation                          |
| `src/hooks/use-webinar.ts`                         | `enablePortal` di defaultValues, edit reset, update mutation        |
| `src/server/api/routers/products.ts`               | Accept `portalEnabled` di create/update input                       |
| `src/server/api/routers/purchases.ts`              | Generate token untuk produk gratis, query `getByPortalToken`        |
| `src/app/api/webhooks/xendit/route.ts`             | Generate token + kirim portal URL di email                            |
| `src/app/api/webhooks/midtrans/route.ts`           | Generate token + kirim portal URL di email                            |
| `src/lib/email.ts`                                 | Tambah param `portalUrl` di `sendProductEmail`                    |
| `src/lib/nodemailer.ts`                            | Tambah param `portalUrl` di `sendProductEmail`                    |
| `src/emails/product-access-email.tsx`              | Render section "Buka Portal Akses" jika `portalUrl` ada             |
| `src/app/portal/[token]/page.tsx`                  | **BARU** — Halaman portal publik                               |

---

## API

### tRPC: `purchases.getByPortalToken`

**Access**: Public (tanpa auth)

**Input**:

```ts
{ token: string }
```

**Output**:

```ts
{
  id: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  createdAt: DateTime
  product: {
    name: string
    image: string | null
    link: string | null
    links: string[] | null
    notes: string | null
    contentType: string | null
  }
}
```

**Error**: `NOT_FOUND` jika token tidak valid.

---

## Halaman Portal

**Route**: `/portal/[token]`

Konten yang ditampilkan:

1. **Header** — Logo CuanIN
2. **Kartu Produk** — Thumbnail, nama produk, badge tipe konten, tanggal pembelian
3. **Info Pembeli** — Nama dan email pembeli
4. **CTA Utama** — Tombol "Masuk ke Produk" → `product.link`
5. **Link Tambahan** — Daftar `product.links[]` (jika ada)
6. **Catatan** — `product.notes` (jika ada)
7. **Footer** — Disclaimer keamanan

Desain: Mobile-first, neo-brutalist (border tebal, offset shadow), warna cyan (#0891b2).

---

## Email Template

Saat `portalEnabled = true`, email berisi tambahan section:

```
Terima kasih atas pembelian Anda!

Link akses produk:
https://...

Atau akses lewat portal kamu:
[ Buka Portal Akses ] ← tombol CTA
https://cuanin.my.id/portal/{token}

Link Tambahan:
1. https://...
2. https://...
```

---

## Token Generation

Token di-generate menggunakan `nanoid(16)` — menghasilkan string URL-safe sepanjang 16 karakter.

**Kapan di-generate**:

| Jalur               | Lokasi                                                        |
| ------------------- | ------------------------------------------------------------- |
| Produk gratis       | `src/server/api/routers/purchases.ts` — langsung completed |
| Pembayaran Xendit   | `src/app/api/webhooks/xendit/route.ts` — saat webhook PAID |
| Pembayaran Midtrans | `src/app/api/webhooks/midtrans/route.ts` — saat settlement |

**Kondisi**: Token hanya dibuat jika `product.portalEnabled === true`.

---

## Migration

```bash
npx prisma db push
# atau
npx prisma migrate dev --name add_portal_feature
```

Existing data tidak terpengaruh (backward compatible):

- `portalEnabled` default `false`
- `portalToken` nullable

---

## Dependencies

| Package    | Versi  | Kegunaan                     |
| ---------- | ------ | ---------------------------- |
| `nanoid` | latest | Generate unique portal token |

---

## Testing Checklist

- [ ] Toggle "Portal Akses" muncul di Pengaturan Tambahan (form digital, kelas, webinar)
- [ ] Toggle tersimpan ke database saat create/update produk
- [ ] Produk gratis + portal aktif → token ter-generate, email berisi link portal
- [ ] Produk berbayar via Xendit + portal aktif → token ter-generate setelah pembayaran
- [ ] Produk berbayar via Midtrans + portal aktif → token ter-generate setelah pembayaran
- [ ] Halaman `/portal/{token}` menampilkan links + notes
- [ ] Token tidak valid → halaman 404
- [ ] Toggle off → behavior sama seperti sebelumnya (tidak ada perubahan)
