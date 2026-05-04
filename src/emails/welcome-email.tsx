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
  main,
  paragraph,
} from "./styles";

export type WelcomeEmailProps = {
  dashboardUrl: string;
  name: string;
  year: number;
};

export function WelcomeEmail({ dashboardUrl, name, year }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Selamat datang di CuanIN, {name}.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Selamat Datang di CuanIN!</Text>
          <Text style={paragraph}>
            Halo <strong>{name}</strong>,
          </Text>
          <Text style={paragraph}>
            Akun kamu telah berhasil dibuat. Sekarang kamu bisa mulai menjual
            produk digital dan menerima pembayaran dengan mudah.
          </Text>
          <Section style={actionSection}>
            <Button href={dashboardUrl} style={button}>
              Masuk ke Dashboard
            </Button>
          </Section>
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
