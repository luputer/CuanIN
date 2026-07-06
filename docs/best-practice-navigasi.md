# Panduan & Praktik Terbaik (Best Practice) Navigasi Next.js: `<Link>` vs `router.push()`

Dokumen ini menjelaskan teori, perbandingan performa, serta daftar refaktorisasi komponen yang dilakukan pada proyek **CuanIN** terkait penggunaan navigasi Next.js Client-side Routing.

---

## 1. Perbedaan Utama & Teori Dasar

Di Next.js App Router, terdapat dua cara utama untuk berpindah halaman: menggunakan komponen `<Link>` dan secara programmatis melalui objek `useRouter().push()`.

### A. Komponen `<Link>` (Direkomendasikan secara Default)
Komponen `<Link>` Next.js memperluas elemen HTML `<a>` standar untuk menyediakan navigasi sisi klien (*client-side navigation*) yang dioptimalkan secara otomatis.

* **Prefetching**: Ketika komponen `<Link>` masuk ke dalam area pandang layar (*viewport*), Next.js akan mengunduh bundle JavaScript dan data halaman tujuan secara asinkron di latar belakang. Saat pengguna mengeklik link tersebut, transisi halaman terasa instan ($\sim 0\text{ ms}$).
* **SEO-Friendly**: Crawler mesin pencari (seperti Googlebot) dapat merayapi tag `<a>` untuk memetakan struktur navigasi web Anda.
* **Aksesibilitas (A11y)**: Mendukung navigasi keyboard (Tombol Tab), pembaca layar (*screen reader*), serta klik kanan (*Open link in new tab* / Ctrl + Klik).

### B. Objek `useRouter().push()` (Navigasi Programmatis)
Perintah JavaScript `router.push()` memicu navigasi dari sisi klien secara prosedural di dalam suatu fungsi.

* **Tanpa Prefetching Otomatis**: Halaman tujuan **tidak diunduh** sebelum diklik. Browser baru mengunduh resource halaman tersebut setelah fungsi `router.push()` dipanggil, yang menyebabkan latensi navigasi (terasa lambat/lemot).
* **Tidak SEO-Friendly**: Mesin pencari tidak dapat mendeteksi tujuan navigasi karena dibungkus di dalam fungsi logika JavaScript.
* **Kurang Aksesibel**: Tidak mendukung klik kanan untuk membuka tab baru.

---

## 2. Decision Matrix: Kapan Harus Menggunakan Apa?

| Skenario Penggunaan | `<Link>` | `router.push()` |
| :--- | :---: | :---: |
| Link Navigasi Menu / Header / Sidebar | ✅ Ya | ❌ Tidak |
| Kartu Daftar (Product Card / List Item) | ✅ Ya | ❌ Tidak |
| Tombol "Kembali" (Ke Halaman Tertentu) | ✅ Ya | ❌ Tidak |
| Redirect Setelah Aksi Asinkron Berhasil (misal: Submit Form / Bayar) | ❌ Tidak | ✅ Ya |
| Redirect Setelah Verifikasi OTP Berhasil | ❌ Tidak | ✅ Ya |
| Menutup Modal & Berpindah Halaman | ❌ Tidak | ✅ Ya |
| Tombol "Kembali" Dinamis (`router.back()`) | ❌ Tidak | ✅ Ya |

---

## 3. Daftar Refaktorisasi Komponen Proyek CuanIN

Beberapa komponen di CuanIN telah dimigrasikan dari `router.push()` ke `<Link>` untuk menghilangkan masalah navigasi lambat (lag) serta memperbaiki validasi HTML:

### 1. [portal-purchase-card.tsx](file:///home/luputer/Dokumen/TA/CuanIN/src/components/portal/portal-purchase-card.tsx)
* **Masalah**: Seluruh kartu dibungkus `<Link>`, tetapi di dalamnya ada `<button>` dengan event `router.push` (Icon Mata). Hal ini menghasilkan struktur HTML tidak valid (tombol di dalam tag `<a>`) dan menyebabkan konflik navigasi di browser.
* **Perbaikan**: Area link dipisah hanya untuk gambar dan info produk. Tombol Icon Mata diubah menjadi `<Link href={detailUrl}>` murni sehingga transisinya cepat dan seragam.

### 2. [portal-combined-header.tsx](file:///home/luputer/Dokumen/TA/CuanIN/src/components/portal/portal-combined-header.tsx) & [catalog-nav-header.tsx](file:///home/luputer/Dokumen/TA/CuanIN/src/components/layout/catalog-nav-header.tsx)
* **Masalah**: Tombol kembali menggunakan fungsi logika klik `router.push(backHref)` yang membuat transisi kembali terasa lemot.
* **Perbaikan**: Menggunakan percabangan kondisi. Jika `backHref` tersedia (statis), gunakan `<Link href={backHref}>`. Jika kosong (dinamis), gunakan `<button onClick={() => router.back()}>`.

### 3. [buttonlogin.tsx](file:///home/luputer/Dokumen/TA/CuanIN/src/components/shared/buttonlogin.tsx)
* **Masalah**: Tombol global ini menggunakan `onClick` dengan `router.push(href)` untuk navigasi.
* **Perbaikan**: Mengubah komponen agar merender `<Link href={href}>` secara dinamis jika properti `href` disediakan, sehingga halaman landing (seperti ke sign-in/register) termuat instan.

### 4. [creator/header.tsx](file:///home/luputer/Dokumen/TA/CuanIN/src/components/creator/header.tsx) & [admin/header.tsx](file:///home/luputer/Dokumen/TA/CuanIN/src/components/admin/header.tsx)
* **Masalah**: Item menu dropdown profil ("Akun Saya" & "Portal Pelanggan") menggunakan tombol dengan `router.push()`.
* **Perbaikan**: Diubah menjadi `<Link>` dengan penambahan handler `onClick={() => setOpen(false)}` untuk menutup dropdown.

---

## 4. Contoh Penulisan Kode yang Benar

### A. Contoh Navigasi Statis (Benar)
```tsx
import Link from 'next/link';

export function NavigationMenu() {
  return (
    <Link 
      href="/dashboard" 
      className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600"
    >
      Ke Dashboard
    </Link>
  );
}
```

### B. Contoh Navigasi Programmatis setelah Logika Selesai (Benar)
```tsx
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';

export function PaymentButton({ purchaseId }: { purchaseId: string }) {
  const router = useRouter();
  const payMutation = api.payment.process.useMutation({
    onSuccess: (data) => {
      // Navigasi programmatis setelah proses pembayaran di backend sukses
      router.push(`/payment/success?id=${data.id}`);
    }
  });

  return (
    <button onClick={() => payMutation.mutate({ id: purchaseId })}>
      Bayar Sekarang
    </button>
  );
}
```
