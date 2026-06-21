"use client";

import { useState, useRef } from "react";
import { PlusIcon } from "@phosphor-icons/react";

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
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-slate-800 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer group"
      >
        <span className="text-base font-medium text-slate-800 pr-4 group-hover:text-cuan-cyan transition-colors duration-200">
          {question}
        </span>
        {/* Plus icon rotates 45deg → becomes an X when open */}
        <span
          className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-300 ${isOpen
            ? "border-cuan-cyan text-cuan-cyan rotate-45"
            : "border-slate-300 text-slate-400 group-hover:border-cuan-cyan group-hover:text-cuan-cyan"
            }`}
        >
          <PlusIcon size={16} weight="bold" />
        </span>
      </button>

      {/* Animated answer: smooth height transition via max-height */}
      <div
        ref={contentRef}
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight ?? 500}px` : "0px",
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <p className="pb-5 text-sm text-slate-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  return (
    <section id="faq" className="w-full pt-8 pb-16 md:pt-16 md:pb-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Judul sama style dengan section lain */}
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold text-slate-800 relative inline-block">
            Mungkin Kamu Bertanya...
          </h2>
          <p className="mt-4 text-slate-600 text-base">
            Temukan jawaban untuk pertanyaan umum tentang CuanIN
          </p>
        </div>

        {/* FAQ list — tanpa card, hanya border bawah per item */}
        <div>
          {FAQ_ITEMS.map((item, index) => (
            <FAQItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
