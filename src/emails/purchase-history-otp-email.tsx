import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";

import {
  container,
  footer,
  heading,
  hr,
  main,
  paragraph,
} from "./styles";

export type PurchaseHistoryOtpEmailProps = {
  otp: string;
  email: string;
  year: number;
};

const otpSection = {
  background: "#f1f5f9",
  borderRadius: "8px",
  margin: "24px 0",
  padding: "24px",
  textAlign: "center" as const,
};

const otpText = {
  color: "#0891b2",
  fontSize: "36px",
  fontWeight: "700",
  letterSpacing: "8px",
  lineHeight: "40px",
  margin: "0",
};

const noteText = {
  ...paragraph,
  fontSize: "13px",
  color: "#64748b",
  marginTop: "0",
};

export function PurchaseHistoryOtpEmail({
  otp,
  email,
  year,
}: PurchaseHistoryOtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Kode OTP Riwayat Pembelian CuanIN: {otp}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Akses Riwayat Pembelian</Text>
          <Text style={paragraph}>
            Kami menerima permintaan untuk mengakses riwayat pembelian dari
            alamat email <strong>{email}</strong>.
          </Text>
          <Text style={paragraph}>
            Gunakan kode OTP berikut untuk melanjutkan:
          </Text>
          <Section style={otpSection}>
            <Text style={otpText}>{otp}</Text>
          </Section>
          <Text style={paragraph}>
            Kode ini berlaku selama <strong>10 menit</strong>.
          </Text>
          <Text style={noteText}>
            Jika kamu tidak meminta akses ini, abaikan email ini. Riwayat
            pembelianmu tetap aman.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>© {year} CuanIN. All rights reserved.</Text>
        </Container>
      </Body>
    </Html>
  );
}
