"use client";

import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";

const FAQ_ITEMS = [
  {
    question: "Apa itu CuanIN?",
    answer:
      "CuanIN adalah platform digital yang memungkinkan kreator untuk menjual produk digital seperti webinar, kelas online, dan produk digital lainnya dengan mudah. Pembeli bisa langsung mengakses produk setelah pembayaran berhasil.",
  },
  {
    question: "Bagaimana cara menjual produk di CuanIN?",
    answer:
      "Daftar sebagai kreator, buat katalog produk kamu, upload produk digital (webinar, kelas, e-book, dll), atur harga, lalu bagikan link katalog ke audiens kamu. CuanIN menangani pembayaran dan pengiriman produk secara otomatis.",
  },
  {
    question: "Metode pembayaran apa saja yang didukung?",
    answer:
      "CuanIN mendukung berbagai metode pembayaran melalui Midtrans termasuk transfer bank (BCA, BNI, BRI, Mandiri, dan lainnya), e-wallet (GoPay, ShopeePay), kartu kredit, dan QRIS.",
  },
  {
    question: "Berapa biaya layanan CuanIN?",
    answer:
      "CuanIN mengenakan biaya layanan yang kompetitif untuk setiap transaksi. Detail biaya dapat dilihat pada halaman pembayaran sebelum pembeli melakukan checkout.",
  },
  {
    question: "Bagaimana cara menarik saldo dari CuanIN?",
    answer:
      "Kreator bisa menarik saldo kapan saja melalui dashboard. Pilih nominal penarikan, masukkan rekening bank tujuan, dan saldo akan diproses dalam 1-2 hari kerja.",
  },
  {
    question: "Apakah pembeli perlu mendaftar akun?",
    answer:
      "Tidak. Pembeli bisa langsung membeli produk tanpa perlu membuat akun. Cukup isi nama, email, dan nomor telepon saat checkout.",
  },
  {
    question: "Bagaimana pembeli mengakses produk setelah membayar?",
    answer:
      "Setelah pembayaran berhasil, pembeli akan menerima link akses produk melalui email. Kreator juga bisa mengaktifkan fitur Portal Akses di mana pembeli bisa melihat semua produk yang sudah dibeli dalam satu halaman.",
  },
  {
    question: "Apakah CuanIN aman untuk transaksi?",
    answer:
      "Ya. Semua transaksi diproses melalui Midtrans, payment gateway terpercaya di Indonesia yang sudah bersertifikasi PCI DSS. Data pembeli juga dienkripsi dan dilindungi.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer"
      >
        <span className="text-base font-medium text-slate-800 pr-4">
          {question}
        </span>
        <CaretDownIcon
          size={20}
          weight="bold"
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <p className="pb-5 text-sm text-slate-600 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

export default function FAQSection() {
  return (
    <section id="faq" className="w-full bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-3 text-slate-500 text-sm">
            Temukan jawaban untuk pertanyaan umum tentang CuanIN
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-6">
          {FAQ_ITEMS.map((item, index) => (
            <FAQItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
