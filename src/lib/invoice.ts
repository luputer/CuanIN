import jsPDF from "jspdf";

type PaymentDetails = {
  paymentType?: string;
  bank?: string;
  vaNumber?: string;
} | null;

type InvoiceData = {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amount: number | string | { toNumber: () => number };
  paidAt: Date | string | null;
  createdAt: Date | string;
  paymentMethod: string | null;
  paymentDetails: unknown;
  product: {
    name: string;
    type: string;
    price: number | string | { toNumber: () => number };
    user: {
      name: string | null;
      catalog: { slug: string } | null;
    };
  };
};

function generateVerificationCode(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

function formatIDR(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_LABEL: Record<string, string> = {
  WEBINAR: "Webinar",
  KELAS_ONLINE: "Kelas Online",
  DIGITAL_PRODUCT: "Produk Digital",
};

export function generateInvoicePDF(data: InvoiceData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const amount = typeof data.amount === "object" && data.amount !== null && "toNumber" in data.amount
    ? data.amount.toNumber()
    : Number(data.amount);
  const paidDate = data.paidAt ?? data.createdAt;
  const invoiceNum = `INV-${data.id.slice(0, 5).toUpperCase()}-${new Date(paidDate).getFullYear()}`;
  const verificationCode = generateVerificationCode(data.id);

  // ─── HEADER ───────────────────────────────────────────────────────────
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(6, 182, 212); // cyan-500
  doc.text("CuanIN", margin, y + 8);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("Platform Produk Digital", margin, y + 14);

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text("INVOICE", pageWidth - margin, y + 8, { align: "right" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(invoiceNum, pageWidth - margin, y + 14, { align: "right" });

  y += 24;

  // ─── DIVIDER ──────────────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ─── INVOICE INFO (right) ─────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Tanggal:", pageWidth - margin - 60, y);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text(`${formatDate(paidDate)}`, pageWidth - margin, y, { align: "right" });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Waktu:", pageWidth - margin - 60, y);
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.text(formatTime(paidDate), pageWidth - margin, y, { align: "right" });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Status:", pageWidth - margin - 60, y);
  doc.setTextColor(22, 163, 74); // green-600
  doc.setFont("helvetica", "bold");
  doc.text("LUNAS", pageWidth - margin, y, { align: "right" });
  y += 12;

  // ─── FROM / TO ────────────────────────────────────────────────────────
  const colWidth = contentWidth / 2 - 5;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("DARI", margin, y);
  doc.text("KEPADA", margin + colWidth + 10, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(data.product.user.name ?? "Kreator", margin, y);
  doc.text(data.buyerName, margin + colWidth + 10, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  const catalogSlug = data.product.user.catalog?.slug ?? "";
  if (catalogSlug) {
    doc.text(catalogSlug, margin, y);
    y += 5;
  }
  doc.text(data.buyerEmail, margin + colWidth + 10, y);
  y += 5;
  doc.text(data.buyerPhone, margin + colWidth + 10, y);
  y += 12;

  // ─── DIVIDER ──────────────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ─── ITEM TABLE HEADER ────────────────────────────────────────────────
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(margin, y - 4, contentWidth, 10, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("PRODUK", margin + 4, y + 2);
  doc.text("TIPE", margin + 90, y + 2);
  doc.text("QTY", margin + 120, y + 2);
  doc.text("HARGA", pageWidth - margin - 4, y + 2, { align: "right" });
  y += 12;

  // ─── ITEM ROW ─────────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);

  const productName = data.product.name.length > 40
    ? data.product.name.slice(0, 40) + "..."
    : data.product.name;
  const productPrice = typeof data.product.price === "object" && data.product.price !== null && "toNumber" in data.product.price
    ? data.product.price.toNumber()
    : Number(data.product.price);

  doc.text(productName, margin + 4, y);
  doc.text(TYPE_LABEL[data.product.type] ?? data.product.type, margin + 90, y);
  doc.text("1", margin + 120, y);
  doc.text(formatIDR(productPrice), pageWidth - margin - 4, y, { align: "right" });
  y += 10;

  // ─── DIVIDER ──────────────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ─── TOTAL ────────────────────────────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("TOTAL", margin + 90, y);
  doc.setTextColor(6, 182, 212); // cyan-500
  doc.text(formatIDR(amount), pageWidth - margin - 4, y, { align: "right" });
  y += 12;

  // ─── PAYMENT INFO ─────────────────────────────────────────────────────
  if (data.paymentMethod) {
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("METODE PEMBAYARAN", margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(data.paymentMethod, margin, y);
    y += 5;

    const details = data.paymentDetails as PaymentDetails;
    if (details?.vaNumber) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`No. VA: ${details.vaNumber}`, margin, y);
      y += 5;
    }
    y += 8;
  }

  // ─── FOOTER ───────────────────────────────────────────────────────────
  const footerY = 270;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184);
  doc.text("KODE VERIFIKASI", margin, footerY + 6);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(verificationCode, margin, footerY + 12);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Dokumen ini digenerate secara elektronik oleh CuanIN dan sah tanpa tanda tangan.",
    margin,
    footerY + 18,
  );
  doc.text(
    `ID Transaksi: ${data.id}`,
    margin,
    footerY + 22,
  );

  const filename = `Invoice-CuanIN-${data.id.slice(0, 8).toUpperCase()}.pdf`;
  doc.save(filename);
}
