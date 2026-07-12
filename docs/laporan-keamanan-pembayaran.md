# BAB IV / V: ANALISIS DAN IMPLEMENTASI KEAMANAN SISTEM KEUANGAN DAN PEMBAYARAN

## 1. Pendahuluan
Keamanan data finansial merupakan aspek paling krusial dalam pengembangan platform e-commerce dan *creators platform* seperti CuanIN. Kesalahan dalam pengelolaan saldo, kebocoran celah transaksi, atau eksploitasi pada penarikan dana dapat mengakibatkan kerugian finansial yang signifikan bagi kreator maupun platform. 

Oleh karena itu, CuanIN mengimplementasikan sistem pertahanan berlapis (defense-in-depth) yang mencakup pola arsitektur pencatatan buku besar (*ledger*), isolasi transaksi database tingkat ACID (Atomicity, Consistency, Isolation, Durability), perlindungan integrasi API gerbang pembayaran (*payment gateway*), serta mekanisme otorisasi yang ketat. Bab ini akan membedah secara teknis implementasi keamanan tersebut.

---

## 2. Keamanan Transaksi dan Pengelolaan Saldo (Ledger Design Pattern)

### 2.1 Konsep Mutasi Saldo *Append-Only*
CuanIN menghindari penyimpanan saldo menggunakan kolom numerik statis (misalnya kolom `balance` pada tabel `User`). Penyimpanan nilai statis sangat rentan terhadap serangan manipulasi langsung pada database (SQL injection atau manipulasi backend) serta menyulitkan proses audit forensik jika terjadi ketidaksesuaian angka.

Sebagai solusinya, sistem keuangan CuanIN mengadopsi **Ledger Design Pattern** (Pola Desain Buku Besar) yang bersifat *Append-Only* (hanya tambah). Setiap transaksi masuk dan keluar dicatat sebagai entri jurnal baru (mutasi) pada tabel `BalanceEntry`. Struktur data mutasi ini tercantum pada kode berikut:

```prisma
model BalanceEntry {
  id        String           @id @default(uuid())
  userId    String
  amount    Decimal
  type      BalanceEntryType
  refId     String?          // Referensi ke transaksi asal (Purchase/Withdrawal)
  note      String?
  createdAt DateTime         @default(now())
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([refId])
  @@index([userId, createdAt])
}
```

Tabel ini bertindak sebagai *single source of truth* untuk seluruh informasi keuangan di platform. Klasifikasi transaksi mutasi diatur melalui enum `BalanceEntryType` sebagai berikut:
1. **Mutasi Kredit (Pemasukan/+):**
   * `PURCHASE_COMPLETED`: Terjadi saat transaksi pembelian produk digital oleh pembeli dinyatakan sukses.
   * `WITHDRAWAL_FAILED`: Dana dikembalikan ke saldo kreator karena permintaan penarikan dana ke rekening bank ditolak atau gagal diproses oleh bank tujuan.
   * `PLATFORM_FEE_EARNED`: Komisi/fee platform masuk ke akun saldo admin saat penarikan dana oleh kreator berhasil.
2. **Mutasi Debit (Pengeluaran/-):**
   * `WITHDRAWAL_REQUESTED`: Pengurangan saldo kreator saat mengajukan penarikan dana.
   * `WITHDRAWAL_REVERSED`: Penarikan kembali fee platform dari saldo admin apabila penarikan dana kreator dinyatakan gagal di kemudian hari.
   * `ADMIN_WITHDRAWAL_REQUESTED`: Pengurangan saldo admin ketika admin mencairkan dana pendapatan fee platform.

### 2.2 Formula Penghitungan Saldo Kumulatif
Untuk mengetahui saldo akhir pengguna secara tepercaya, sistem tidak membaca suatu variabel statis, melainkan melakukan kalkulasi agregasi penjumlahan (`SUM`) dari seluruh baris mutasi `BalanceEntry` yang dimiliki oleh pengguna tersebut:

$$\text{Saldo Akhir} = \sum (\text{Mutasi Kredit}) - \sum (|\text{Mutasi Debit}|)$$

Secara teknis di backend, formula agregasi di atas dieksekusi secara real-time melalui *database query query* sebagai berikut:

```typescript
const [credits, debits] = await Promise.all([
  db.balanceEntry.aggregate({
    where: { userId, amount: { gt: 0 } },
    _sum: { amount: true },
  }),
  db.balanceEntry.aggregate({
    where: { userId, amount: { lt: 0 } },
    _sum: { amount: true },
  }),
]);

const totalIncome = Number(credits._sum.amount ?? 0);
const totalWithdrawn = Math.abs(Number(debits._sum.amount ?? 0));
const currentBalance = totalIncome - totalWithdrawn;
```

Penggunaan metode ini menjamin tersedianya **Audit Trail** (jejak audit) yang lengkap dan tidak dapat dimanipulasi, karena setiap perubahan saldo harus disertai dengan bukti alasan transaksi (`refId` dan `type`).

---

## 3. Pencegahan Serangan Finansial dan Konsistensi Data

### 3.1 Penanganan *Race Condition* (*Double Spending*) menggunakan *Database Transaction*
*Race condition* atau kondisi balapan dapat terjadi ketika pengguna mengirimkan beberapa permintaan penarikan dana secara simultan di milidetik yang sama. Jika server memproses permintaan-permintaan tersebut secara paralel tanpa pengaman, sistem dapat meloloskan penarikan ganda melebihi saldo yang sebenarnya dimiliki oleh pengguna tersebut (*Double Spending*).

CuanIN mencegah celah keamanan ini dengan memanfaatkan fitur **Database Transaction (`$transaction`)** yang menjamin sifat atomisitas (ACID) transaksi. Di bawah ini adalah logika penanganan penarikan dana yang aman:

```typescript
const withdrawal = await ctx.db.$transaction(async (tx) => {
  // 1. Memeriksa saldo terkini di dalam sesi transaksi terisolasi
  const balance = await getCreatorBalance(tx, ctx.session.user.id);
  
  // 2. Validasi kecukupan saldo (jumlah penarikan + biaya platform + transfer)
  if (totalDeduction > balance.balance) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Saldo tidak mencukupi untuk melakukan penarikan.",
    });
  }

  // 3. Jika saldo cukup, buat catatan penarikan dengan status PENDING
  const newWithdrawal = await tx.withdrawal.create({
    data: {
      userId: ctx.session.user.id,
      amount: totalDeduction,
      status: "PENDING",
      ...
    },
  });

  // 4. Catat mutasi DEBIT secara instan di tabel BalanceEntry
  await tx.balanceEntry.create({
    data: {
      userId: ctx.session.user.id,
      amount: -totalDeduction,
      type: "WITHDRAWAL_REQUESTED",
      refId: newWithdrawal.id,
    },
  });

  return newWithdrawal;
});
```

Dengan dibungkus `$transaction`, database PostgreSQL akan menempatkan kunci penguncian (*lock*) pada tabel yang diakses. Jika ada request kedua masuk secara bersamaan, request tersebut harus mengantre hingga request pertama selesai. Ketika giliran request kedua diproses, saldo pengguna sudah terpotong oleh request pertama, sehingga request kedua otomatis ditolak di langkah pemeriksaan kecukupan saldo.

### 3.2 Penanganan Kegagalan Gateway dan Mekanisme *Rollback* / Jurnal Balik
Ketika penarikan dana diproses ke pihak ketiga (misalnya ke sistem perbankan via Xendit Payout API), ada potensi transaksi tersebut gagal di tengah jalan (misalnya rekening tujuan tidak valid, gangguan sistem bank, dll.). 

Untuk menjaga konsistensi keuangan, sistem CuanIN tidak akan menghapus entri debit `WITHDRAWAL_REQUESTED` yang sudah tercatat. Penghapusan baris data dilarang demi menjaga integritas audit trail. Sebagai gantinya, sistem menerapkan mekanisme **Jurnal Balik** dengan memasukkan entri mutasi positif baru berkategori `WITHDRAWAL_FAILED` untuk mengembalikan saldo kreator:

```typescript
// Jika API Xendit melempar error, transaksi di-rollback secara logis
await ctx.db.$transaction([
  ctx.db.withdrawal.update({
    where: { id: withdrawalId },
    data: {
      status: "FAILED",
      failureMessage: errorMessage,
    },
  }),
  ctx.db.balanceEntry.create({
    data: {
      userId: creatorId,
      amount: totalDeduction, // Bernilai positif untuk mengembalikan saldo
      type: "WITHDRAWAL_FAILED",
      refId: withdrawalId,
      note: `Pengembalian dana akibat penarikan gagal: ${errorMessage}`,
    },
  }),
]);
```

---

## 4. Pengamanan Integrasi API Webhook Gateway Pembayaran (Payment Gateway)

Saat pembeli menyelesaikan transaksi melalui Midtrans Snap API, Midtrans akan mengirimkan pemberitahuan status transaksi secara asinkron (callback HTTP POST) ke endpoint webhook CuanIN. Karena endpoint ini terbuka secara publik di internet, diperlukan pengamanan berlapis untuk mencegah manipulasi.

### 4.1 Verifikasi Tanda Tangan Kriptografi (*HMAC Signature Verification*)
Penyerang dapat mencoba menembak endpoint webhook dengan data palsu yang menyatakan bahwa mereka telah membayar suatu produk secara sukses. Untuk mencegah pemalsuan ini, sistem CuanIN melakukan verifikasi tanda tangan kriptografi (*Signature Verification*) menggunakan algoritma SHA-512. Tanda tangan dihitung berdasarkan data transaksi asli digabungkan dengan kunci rahasia (*Server Key*) yang hanya diketahui oleh Midtrans dan server CuanIN:

$$\text{Signature Key} = \text{SHA512}(\text{order\_id} + \text{status\_code} + \text{gross\_amount} + \text{MIDTRANS\_SERVER\_KEY})$$

Kode verifikasi pada endpoint webhook CuanIN diimplementasikan sebagai berikut:

```typescript
const verifyString = order_id + status_code + gross_amount + env.MIDTRANS_SERVER_KEY;
const expectedSignature = crypto
  .createHash("sha512")
  .update(verifyString)
  .digest("hex");

if (signature_key !== expectedSignature) {
  console.warn("Peringatan: Tanda tangan webhook tidak valid!");
  return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
}
```
Apabila penyerang memodifikasi isi data atau status transaksi, nilai hash hasil kalkulasi di server CuanIN tidak akan cocok dengan `signature_key` yang dikirim, dan request tersebut akan ditolak dengan status HTTP 401 Unauthorized.

### 4.2 Pencegahan Serangan Pengulangan (*Replay Attacks* / Idempotensi)
Jaringan internet yang tidak stabil dapat menyebabkan server Midtrans mengirimkan webhook yang sama berkali-kali (*retries*). Jika tidak ditangani, hal ini berisiko memicu eksekusi penambahan saldo berkali-kali untuk satu kali pembayaran.

CuanIN menyelesaikan masalah ini dengan mendesain kueri database secara idempotent menggunakan klausa kondisi status pembayaran yang spesifik:

```typescript
await tx.purchase.update({
  where: { 
    id: purchaseId, 
    status: "pending" // Hanya memperbarui jika status transaksi masih 'pending'
  },
  data: {
    status: "completed",
    paidAt: new Date(),
  },
});
```

Jika webhook kedua dikirim untuk ID transaksi yang sama, kueri di atas akan melempar pengecualian (*exception*) karena status transaksi di database sudah berubah menjadi `completed` pada pemrosesan webhook pertama. Transaksi akan langsung dihentikan sebelum sempat membuat mutasi saldo `BalanceEntry` baru, sehingga saldo kreator dijamin aman dari penambahan ganda.

### 4.3 Kebijakan Larangan Pembelian Mandiri (*Self-Buying Prevention*)
Untuk menghindari sirkulasi uang fiktif dan potensi manipulasi analitik (misal meningkatkan statistik popularitas produk secara palsu), sistem memblokir pembelian produk milik sendiri di tingkat logika aplikasi:
```typescript
if (ctx.session?.user && ctx.session.user.id === product.userId) {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "Anda dilarang membeli produk buatan Anda sendiri.",
  });
}
```

---

## 5. Keamanan Akses dan Otorisasi API (Access Control)

### 5.1 Otorisasi Berbasis Peran (*Role-Based Access Control*)
CuanIN membagi fungsionalitas sistem berdasarkan tiga tingkatan peran pengguna (*roles*): `ADMIN`, `CREATOR`, dan `USER`. Hak akses dibatasi menggunakan middleware terenkripsi pada tRPC router:
* **`publicProcedure`**: Dapat diakses tanpa autentikasi (misal melihat halaman produk publik, mengajukan checkout).
* **`protectedProcedure`**: Memeriksa sesi pengguna aktif (menggunakan JWT/Session Cookie). Digunakan untuk mengakses menu utama kreator (tambah produk, edit profil, tarik saldo).
* **`adminProcedure`**: Hanya mengizinkan pengguna yang memiliki status `role: "ADMIN"`. Prosedur ini digunakan untuk menyetujui penarikan saldo dan mengawasi total transaksi sistem secara global.

### 5.2 Pengamanan Endpoint API tRPC
Semua data sensitif disaring sebelum dikirim ke klien. Sebagai contoh, informasi link download produk digital atau kredensial akses kelas online hanya akan dikirim setelah database mengonfirmasi status transaksi pembeli telah bernilai `completed`. Pembeli anonim atau pengguna lain yang menembak API detail transaksi secara acak akan diblokir oleh validasi hak kepemilikan data.

---

## 6. Ringkasan Parameter Keamanan Keuangan CuanIN

Tabel berikut menyimpulkan ancaman keamanan pada sistem transaksi digital dan solusi proteksi yang diimplementasikan pada CuanIN:

| No | Jenis Potensi Ancaman Keamanan | Solusi Proteksi Teknis | Dampak Positif |
| :-: | :--- | :--- | :--- |
| 1 | **Manipulasi Saldo Langsung** (Modifikasi angka di kolom database) | Skema *Append-Only Ledger* tabel `BalanceEntry` | Data transaksi transparan, memiliki jejak audit (*audit trail*), dan tidak dapat diubah tanpa entri mutasi penyeimbang. |
| 2 | **Double Spending / Race Condition** (Penarikan dana bersamaan di satu waktu) | Transaksi Database Prisma (`$transaction` ACID isolation) | Mencegah penarikan dana melebihi sisa saldo karena antrean proses dieksekusi secara sekuensial. |
| 3 | **Pemalsuan Webhook Status** (Penyerang menembak API status bayar) | Validasi Kriptografi HMAC SHA-512 dengan Server Key | Webhook palsu akan langsung ditolak dengan respons HTTP 401 karena kunci rahasia tidak cocok. |
| 4 | **Replay Attacks** (Webhook terkirim berulang karena gangguan jaringan) | Kueri Kondisional Idempotent (`status: "pending"`) | Transaksi hanya diproses sekali; mencegah penambahan saldo ganda untuk satu bukti bayar. |
| 5 | **Money Laundering / Manipulasi Statistik** (Membeli produk milik sendiri) | Proteksi Kontrol Logika *Self-Buying Prevention* | Menjaga orisinalitas transaksi dan keaslian data analitik platform. |
| 6 | **Eksploitasi Akses Endpoint** (Mengakses API sensitif pengguna lain) | Otentikasi Sesi dan Otorisasi Tingkat Prosedur tRPC | Memastikan pengguna hanya dapat memanipulasi data yang menjadi hak miliknya atau sesuai dengan perannya. |
