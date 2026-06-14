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
  productLink: string;
  notes?: string | null;
  links?: string[] | null;
  year: number;
};

export function ProductAccessEmail({
  productName,
  productLink,
  links,
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

          {links && links.length > 0 && (
            <>
              <Text style={heading}>Link Tambahan</Text>
              <Section style={{ backgroundColor: "#f1f5f9", padding: "16px", borderRadius: "8px" }}>
                {links.map((link, index) => (
                  <Text key={index} style={{ ...paragraph, margin: "4px 0" }}>
                    {index + 1}.{" "}
                    <Link href={link} style={{ color: "#0891b2", wordBreak: "break-all" }}>
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

