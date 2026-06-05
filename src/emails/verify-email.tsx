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

export type VerifyEmailProps = {
  otp: string;
  name: string;
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

export function VerifyEmail({ otp, name, year }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Kode OTP Verifikasi CuanIN: {otp}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Verifikasi Email Anda</Text>
          <Text style={paragraph}>
            Halo <strong>{name}</strong>,
          </Text>
          <Text style={paragraph}>
            Terima kasih telah mendaftar di CuanIN. Gunakan kode OTP di bawah ini untuk memverifikasi alamat email Anda dan mengaktifkan akun Anda.
          </Text>
          <Section style={otpSection}>
            <Text style={otpText}>{otp}</Text>
          </Section>
          <Text style={paragraph}>
            Kode ini berlaku selama 10 menit. Jika Anda tidak mendaftar di CuanIN, abaikan email ini.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>© {year} CuanIN. All rights reserved.</Text>
        </Container>
      </Body>
    </Html>
  );
}
