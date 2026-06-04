import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
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
  productLink: string;
  notes?: string | null;
  year: number;
};

export function ProductAccessEmail({
  productName,
  productLink,
  notes,
  year,
}: ProductAccessEmailProps) {
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
          <Text style={paragraph}>
            Kamu dapat mengakses produk melalui tombol di bawah ini:
          </Text>
          <Section style={actionSection}>
            <Button href={productLink} style={button}>
              Masuk ke Produk Kamu
            </Button>
          </Section>
          <Text style={paragraph}>
            Atau copy dan paste link berikut ke browser kamu:
          </Text>
          <Text style={linkText}>{productLink}</Text>

          {notes && (
            <>
              <Text style={heading}>Catatan Tambahan</Text>
              <Text style={{ ...paragraph, backgroundColor: "#f1f5f9", padding: "16px", borderRadius: "8px", whiteSpace: "pre-wrap" }}>
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

ProductAccessEmail.PreviewProps = {
  productName: "Webinar Bisnis Sukses",
  productLink: "https://cuanin.com/product/123",
  notes: "Terima kasih sudah membeli produk kami. Silakan bergabung di grup WA berikut: https://chat.whatsapp.com/... \nPersiapkan diri 15 menit sebelum dimulai.",
  year: new Date().getFullYear(),
} as ProductAccessEmailProps;
