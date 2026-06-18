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
      <Preview>Dana {formattedAmount} sudah dikirim ke rekening kamu.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Dana Berhasil Dikirim ✅</Text>
          <Text style={paragraph}>
            Halo <strong>{accountHolderName}</strong>,
          </Text>
          <Text style={paragraph}>
            Kabar baik! Admin CuanIN telah mengkonfirmasi transfer dan dana
            penarikan kamu sudah dikirim ke rekening berikut:
          </Text>
          <Section style={detailBox}>
            <Text style={detailLabel}>Jumlah Diterima</Text>
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
            Biasanya proses ini membutuhkan waktu hingga 1x24 jam kerja.
          </Text>
          <Text style={paragraph}>
            Jika dana belum masuk setelah 1x24 jam kerja atau ada pertanyaan,
            jangan ragu untuk membalas email ini.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>© {year} CuanIN. All rights reserved.</Text>
        </Container>
      </Body>
    </Html>
  );
}
