# Panduan Konfigurasi Rate Limiting di Vercel & Cloudflare (CuanIN)

Meskipun kita sudah mengamankan backend dengan membatasi **1 email = maksimal 1 kirim OTP per 60 detik**, bot penyerang tetap bisa melakukan brute force dengan cara:
1. **Menggilir email**: Mengirim request OTP ke `email_A`, lalu `email_B`, lalu `email_C`, sehingga tidak terkena limit 60 detik per email.
2. **Brute Force OTP**: Mengirim tebakan OTP terus menerus ke server.

Untuk menghentikan ini secara total, kita harus membatasi request berdasarkan **Alamat IP Pengirim (IP-Based Rate Limiting)** di tingkat Network/Edge (sebelum request masuk ke serverless function Next.js).

Berikut adalah cara termudah dan paling efektif untuk menerapkannya:

---

## Opsi 1: Menggunakan Vercel WAF Rate Limiting (Sangat Direkomendasikan & Gratis)

Vercel memiliki fitur **Web Application Firewall (WAF)** gratis yang memungkinkan Anda membatasi request per IP langsung dari Dashboard Vercel. Pengecekan ini berjalan di Edge network Vercel sehingga tidak memakan kuota serverless function Anda.

### Langkah-langkah:
1. Masuk ke **[Vercel Dashboard](https://vercel.com/)** dan pilih project **CuanIN**.
2. Buka tab **Settings** di bagian atas, lalu pilih menu **Security** di bilah kiri.
3. Scroll ke bawah sampai menemukan bagian **Web Application Firewall (WAF)** atau **Rate Limiting**.
4. Klik **Create Rule** atau **Add Rate Limit**:
   * **Name**: `Rate Limit OTP & Sign Up`
   * **Path / Request Match**: Match jika URL mengandung:
     * `/api/trpc/auth.verifyOtp`
     * `/api/trpc/auth.resendOtp`
     * `/api/trpc/auth.register`
   * **Rate Limit**: Batasi misalnya **10 request per 1 menit** (atau 60 request per 10 menit) per Alamat IP (`IP Address`).
   * **Action**: **Block** (kembalikan HTTP Status `429 Too Many Requests` atau `403 Forbidden`).
5. Klik **Create / Save**.

> [!TIP]
> Dengan menyetel ini, setiap IP yang menembak API OTP lebih dari 10 kali dalam semenit akan otomatis diblokir oleh Vercel di tingkat CDN.

---

## Opsi 2: Menggunakan Cloudflare WAF (Jika Domain Menggunakan Cloudflare)

Jika domain Anda `cuanin.my.id` diarahkan menggunakan Cloudflare, Anda dapat membuat aturan pembatasan gratis yang sangat kuat di Cloudflare.

### Langkah-langkah:
1. Masuk ke **[Cloudflare Dashboard](https://dash.cloudflare.com/)** dan pilih domain Anda (`cuanin.my.id`).
2. Buka menu **Security** -> **WAF** -> **Rate limiting rules**.
3. Klik **Create rate limiting rule**:
   * **Rule Name**: `Limit OTP Spammer`
   * **If incoming requests match**:
     * Field: `URI Path`
     * Operator: `contains`
     * Value: `/api/trpc/auth.verifyOtp`
     * *(Tambahkan OR untuk `/api/trpc/auth.resendOtp`)*
   * **With characteristics**: `IP Address`
   * **When rate exceeds**:
     * Requests: `5`
     * Period: `1 minute`
   * **Then take action**: **Block** atau **Interactive Challenge** (Menampilkan Google/Cloudflare Captcha).
4. Klik **Deploy**.

---

## Opsi 3: Memasang Cloudflare Turnstile / Google reCAPTCHA di UI

Cara lain untuk menghentikan bot otomatis adalah dengan memaksa pengguna menyelesaikan tantangan Captcha sebelum tombol **"Daftar"** atau **"Kirim OTP"** bisa ditekan.

* **Cara kerja**: Saat user klik tombol, browser meminta token captcha dari Cloudflare/Google, lalu mengirimkan token tersebut ke backend tRPC. Backend akan memvalidasi token tersebut ke API Google/Cloudflare. Jika valid, barulah OTP dikirim.
* Ini adalah perlindungan terbaik jika penyerang menggunakan *IP Proxy yang dinamis (rotating proxy)* untuk mem-bypass rate limiting per IP.
