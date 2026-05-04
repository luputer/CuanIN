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
  detailBox,
  detailLabel,
  detailValue,
  finalDetailValue,
  footer,
  heading,
  hr,
  main,
  paragraph,
  successValue,
} from "./styles";

export type WithdrawalSuccessEmailProps = {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  formattedAmount: string;
  year: number;
};

export function WithdrawalSuccessEmail({
  accountHolderName,
  accountNumber,
  bankName,
  formattedAmount,
  year,
}: WithdrawalSuccessEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Penarikan saldo {formattedAmount} berhasil diproses.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Penarikan Saldo Berhasil</Text>
          <Text style={paragraph}>
            Halo <strong>{accountHolderName}</strong>,
          </Text>
          <Text style={paragraph}>
            Penarikan saldo kamu telah berhasil diproses. Berikut detailnya:
          </Text>
          <Section style={detailBox}>
            <Text style={detailLabel}>Jumlah</Text>
            <Text style={successValue}>{formattedAmount}</Text>
            <Text style={detailLabel}>Bank</Text>
            <Text style={detailValue}>{bankName}</Text>
            <Text style={detailLabel}>No. Rekening</Text>
            <Text style={detailValue}>{accountNumber}</Text>
            <Text style={detailLabel}>Atas Nama</Text>
            <Text style={finalDetailValue}>{accountHolderName}</Text>
          </Section>
          <Text style={paragraph}>
            Dana akan masuk ke rekening kamu sesuai jam operasional bank.
          </Text>
          <Text style={paragraph}>
            Jika ada pertanyaan, balas email ini ya.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>© {year} CuanIN. All rights reserved.</Text>
        </Container>
      </Body>
    </Html>
  );
}
