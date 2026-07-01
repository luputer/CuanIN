import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";

import {
  actionSection,
  button,
  container,
  footer,
  heading,
  hr,
  linkText,
  main,
  paragraph,
} from "./styles";

export type ProductAccessEmailProps = {
  productName: string;
  links: string[];
  notes?: string | null;
  portalUrl?: string | null;
  year: number;
};

export function ProductAccessEmail({
  productName,
  links,
  notes,
  portalUrl,
  year,
}: ProductAccessEmailProps) {
  // Ambil link utama (indeks 0) dan link tambahan (sisanya)
  const primaryLink = links[0];
  const additionalLinks = links.slice(1);

  return (
    <Html>
      <Head />
      <Preview>Akses produk kamu sudah siap.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Terima Kasih Atas Pembelian Kamu!</Text>
          <Text style={paragraph}>Halo,</Text>
          <Text style={paragraph}>
            Terima kasih telah membeli produk <strong>{productName}</strong>.
            Pembayaran kamu telah kami terima.
          </Text>

          {portalUrl ? (
            <>
              <Text style={paragraph}>
                Akses semua link, catatan, dan materi produk kamu melalui portal pribadi:
              </Text>
              <Section style={actionSection}>
                <Button href={portalUrl} style={button}>
                  Buka Portal Akses
                </Button>
              </Section>
              <Text style={paragraph}>
                Link Portal: <Link href={portalUrl} style={linkText}>{portalUrl}</Link>
              </Text>
              <Text style={{ ...paragraph, fontSize: "13px", color: "#64748b" }}>
                Link portal berlaku selama 24 jam.
              </Text>

              {primaryLink && (
                <>
                  <Text style={{ ...paragraph, fontSize: "13px", color: "#64748b" }}>
                    Atau akses langsung link produk utama:
                  </Text>
                  <Text style={linkText}>
                    <Link href={primaryLink} style={linkText}>{primaryLink}</Link>
                  </Text>
                </>
              )}
            </>
          ) : (
            <>
              <Text style={paragraph}>
                Kamu dapat mengakses produk melalui tombol di bawah ini:
              </Text>
              <Section style={actionSection}>
                <Button href={primaryLink} style={button}>
                  Masuk ke Produk Kamu
                </Button>
              </Section>
              <Text style={paragraph}>
                Atau copy dan paste link berikut ke browser kamu:
              </Text>
              <Text style={linkText}>{primaryLink}</Text>
            </>
          )}

          {/* Menampilkan Link Tambahan jika ada */}
          {additionalLinks.length > 0 && (
            <>
              <Text style={heading}>Link Tambahan</Text>
              <Section style={{ backgroundColor: "#f1f5f9", padding: "16px", borderRadius: "8px" }}>
                {additionalLinks.map((link, index) => (
                  <Text key={index} style={{ ...paragraph, margin: "4px 0" }}>
                    {index + 1}.{" "}
                    <Link href={link} style={{ color: "#00B3E9", wordBreak: "break-all" }}>
                      {link}
                    </Link>
                  </Text>
                ))}
              </Section>
            </>
          )}

          {notes && (
            <>
              <Text style={heading}>Catatan Tambahan</Text>
              <Text style={{ ...paragraph, backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", whiteSpace: "pre-wrap" }}>
                {notes}
              </Text>
            </>
          )}

          <Text style={paragraph}>
            Jika ada pertanyaan, jangan ragu untuk membalas email ini.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>© {year} CuanIN. All rights reserved.</Text>
        </Container>
      </Body>
    </Html>
  );
}