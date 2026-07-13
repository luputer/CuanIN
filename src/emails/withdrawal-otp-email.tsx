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
import * as React from "react";

import {
  container,
  footer,
  heading,
  hr,
  main,
  paragraph,
} from "./styles";

export type WithdrawalOtpEmailProps = {
  otp: string;
  name: string;
  amount: number;
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
  color: "#e11d48", // red accent color for security actions
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

export function WithdrawalOtpEmail({
  otp,
  name,
  amount,
  year,
}: WithdrawalOtpEmailProps) {
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <Html>
      <Head />
      <Preview>Kode OTP Penarikan Saldo CuanIN: {otp}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Verifikasi Penarikan Saldo</Text>
          <Text style={paragraph}>
            Halo <strong>{name}</strong>,
          </Text>
          <Text style={paragraph}>
            Kami menerima permintaan penarikan saldo sebesar <strong>{formattedAmount}</strong> dari akun Anda.
          </Text>
          <Text style={paragraph}>
            Gunakan kode OTP berikut untuk memverifikasi tindakan ini:
          </Text>
          <Section style={otpSection}>
            <Text style={otpText}>{otp}</Text>
          </Section>
          <Text style={paragraph}>
            Kode ini berlaku selama <strong>10 menit</strong>.
          </Text>
          <Text style={noteText}>
            PENTING: Jangan berikan kode OTP ini kepada siapa pun, termasuk pihak yang mengaku dari CuanIN. Jika Anda tidak melakukan permintaan ini, segera ubah kata sandi akun Anda.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>© {year} CuanIN. All rights reserved.</Text>
        </Container>
      </Body>
    </Html>
  );
}
