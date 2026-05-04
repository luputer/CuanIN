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
  year: number;
};

export function ProductAccessEmail({
  productName,
  productLink,
  year,
}: ProductAccessEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Akses produk digital kamu sudah siap.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Terima Kasih Atas Pembelian Kamu!</Text>
          <Text style={paragraph}>Halo,</Text>
          <Text style={paragraph}>
            Terima kasih telah membeli produk <strong>{productName}</strong>.
            Pembayaran kamu telah kami terima.
          </Text>
          <Text style={paragraph}>
            Kamu dapat mengakses produk digital melalui tombol di bawah ini:
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
          <Text style={paragraph}>
            Jika kamu memiliki pertanyaan, jangan ragu untuk membalas email ini.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>© {year} CuanIN. All rights reserved.</Text>
        </Container>
      </Body>
    </Html>
  );
}
