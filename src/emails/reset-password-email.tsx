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
  linkText,
} from "./styles";

export type ResetPasswordEmailProps = {
  resetUrl: string;
  name: string;
  year: number;
};

export function ResetPasswordEmail({ resetUrl, name, year }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Permintaan Reset Password Akun CuanIN</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Reset Password Anda</Text>
          <Text style={paragraph}>
            Halo <strong>{name}</strong>,
          </Text>
          <Text style={paragraph}>
            Kami menerima permintaan untuk mereset password akun CuanIN Anda. Klik tombol di bawah ini untuk mengatur password baru.
          </Text>
          <Section style={actionSection}>
            <Button href={resetUrl} style={button}>
              Reset Password
            </Button>
          </Section>
          <Text style={paragraph}>
            Atau salin dan tempel link berikut ke browser Anda:
          </Text>
          <Text style={linkText}>{resetUrl}</Text>
          <Text style={paragraph}>
            Link ini berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>© {year} CuanIN. All rights reserved.</Text>
        </Container>
      </Body>
    </Html>
  );
}
