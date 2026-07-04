# Dokumentasi Perbaikan Sistem Autentikasi & Keamanan (CuanIN)

Dokumen ini menjelaskan rangkaian perbaikan keamanan dan perbaikan bug alur registrasi yang telah diterapkan pada sistem autentikasi proyek **CuanIN**.

---

## 1. Masalah & Perbaikan yang Diterapkan

### A. Celah Keamanan: Spam Email OTP (Bypass Client-Side & No Rate Limit)
* **Masalah**: 
  * Halaman `/verify-otp` memiliki pemeriksaan cookie `otp_authorized_email` di client-side, namun bisa di-bypass sepenuhnya hanya dengan menambahkan parameter URL `&from=sso`. Hal ini memungkinkan penyerang membuka halaman verifikasi email apa pun.
  * Tombol **"Kirim Ulang Kode"** di client-side tidak dibatasi di sisi server. Penyerang dapat membuat script untuk menembak endpoint tRPC `resendOtp` atau `register` ribuan kali per detik, menghabiskan kuota SMTP email Anda.
* **Solusi**:
  * Pengecekan kepemilikan OTP dipindahkan sepenuhnya ke sisi server ([src/server/lib/otp-session.ts](file:///home/luputer/Dokumen/TA/CuanIN/src/server/lib/otp-session.ts)) menggunakan cookie `httpOnly` secure. Endpoint `verifyOtp` dan `resendOtp` kini wajib memanggil `assertOtpOwnership(email)`.
  * Menambahkan **Server-Side Rate Limiting** (`assertResendCooldown`) dengan membatasi pembuatan OTP baru maksimal 1 kali per 60 detik per email. Jika dicoba berulang-ulang, server akan melempar error `TOO_MANY_REQUESTS`.

---

### B. Pembersihan Akun & Token Spammer (Joni Warta)
* **Masalah**: Spammer menggunakan nama "Joni Warta" dan domain email palsu `gmailmail.com` mengirim ratusan pendaftaran sampah dan mengotori database.
* **Solusi**:
  * Membuat script pembersih database di [scripts/delete-joni-warta.ts](file:///home/luputer/Dokumen/TA/CuanIN/scripts/delete-joni-warta.ts).
  * Menghapus **278 akun spammer** Joni Warta secara bersih (menggunakan fitur `onDelete: Cascade` pada skema Prisma sehingga data relasi ikut terhapus).
  * Menghapus **363 token verifikasi sampah** yang tertinggal di tabel `VerificationToken` yang menggunakan domain palsu `gmailmail.com`.

---

### C. Bug Alur Registrasi: Upgrade Akun Pembeli (`USER`) Menjadi Kreator (`CREATOR`)
* **Masalah**: 
  * Ketika pembeli yang sudah terdaftar di database dengan role `"USER"` mencoba mendaftar sebagai Kreator menggunakan email yang sama di `/sign-up`, sistem melempar error `CONFLICT` (email sudah terdaftar). Jika mereka masuk lewat Google SSO, mereka berhasil masuk tetapi rolenya tetap `"USER"` dan tidak diarahkan ke setup katalog.
* **Solusi**:
  1. **Upgradable Role di Router**: Pada mutasi `register` di [src/server/api/routers/auth.ts](file:///home/luputer/Dokumen/TA/CuanIN/src/server/api/routers/auth.ts), jika email terdeteksi dengan role `"USER"`, backend akan mengizinkan pendaftaran dan memperbarui rolenya menjadi `"CREATOR"`.
  2. **Intersepsi Callback SignIn**: Di [src/server/auth.ts](file:///home/luputer/Dokumen/TA/CuanIN/src/server/auth.ts), jika user ber-role `"USER"` mencoba login biasa, ia akan diintersepsi dan dialihkan ke `/sign-up` terlebih dahulu agar melengkapi nomor telepon dan meng-upgrade akunnya secara resmi.
  3. **Refresh Sesi Otomatis**: Di halaman pendaftaran client-side [src/app/(global-auth)/sign-up/page.tsx](file:///home/luputer/Dokumen/TA/CuanIN/src/app/%28global-auth%29/sign-up/page.tsx), setelah pendaftaran Google SSO selesai, client memanggil `await update()` untuk memperbarui sesi JWT aktif ke `"CREATOR"` sebelum dialihkan ke `/dashboard` (yang kemudian otomatis mengarahkan ke `/setup` karena belum memiliki katalog).

---

## 2. Apakah Error Sebelumnya Masih Diperlukan?

Ya, error checks sebelumnya **sangat diperlukan**. 

### Pengecekan `!user.emailVerified` di `authorize()`:
```typescript
if (!user.emailVerified) {
  await setOtpOwnership(email);
  throw new Error("Email belum diverifikasi. Silakan cek email Anda.");
}
```
* **Mengapa ini harus tetap ada?**
  Jika pengguna mendaftar dengan email dan password (credentials), tetapi menutup browser mereka sebelum memverifikasi OTP, akun mereka sudah terbuat di database namun status `emailVerified` masih `null`.
  Saat mereka mencoba login kembali:
  1. `authorize()` memverifikasi password mereka benar.
  2. Karena belum verifikasi, server melempar error *"Email belum diverifikasi"*.
  3. Di saat yang sama, server memanggil `setOtpOwnership(email)` untuk menyetel cookie kepemilikan OTP.
  4. Halaman login menangkap error ini dan mengarahkan mereka secara aman ke halaman `/verify-otp` agar mereka dapat menyelesaikan pendaftaran.
  *Tanpa pengecekan ini, pengguna yang belum terverifikasi bisa langsung masuk melewati sistem verifikasi email, atau mereka akan terjebak selamanya tidak bisa masuk karena tidak ada mekanisme verifikasi ulang.*

---

## 3. Status Verifikasi Sistem
* Seluruh kode telah diuji keamanannya.
* Pengecekan tipe data menggunakan perintah `npx tsc --noEmit` telah dijalankan dan **lulus 100% tanpa error**.
* Keamanan API tRPC sekarang dilindungi dari manipulasi parameter URL client-side.
