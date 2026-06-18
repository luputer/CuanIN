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
  Link,
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

export type PortalLinkEmailProps = {
  buyerName: string;
  productName: string;
  portalUrl: string;
  year: number;
};

export function PortalLinkEmail({
  buyerName,
  productName,
  portalUrl,
  year,
}: PortalLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Link portal akses kamu sudah siap.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Akses Portal Kamu</Text>
          <Text style={paragraph}>
            Halo <strong>{buyerName}</strong>,
          </Text>
          <Text style={paragraph}>
            Berikut link portal pribadi kamu untuk mengakses semua produk dari{" "}
            <strong>{productName}</strong>. Klik tombol di bawah untuk membuka
            portal.
          </Text>
          <Section style={actionSection}>
            <Button href={portalUrl} style={button}>
              Buka Portal Akses
            </Button>
          </Section>
          <Text style={paragraph}>
            Atau salin dan tempel link berikut ke browser kamu:
          </Text>
          <Text style={linkText}>
            <Link href={portalUrl} style={{ color: "#0891b2" }}>
              {portalUrl}
            </Link>
          </Text>
          <Text
            style={{
              ...paragraph,
              fontSize: "14px",
              color: "#64748b",
            }}
          >
            Link ini bersifat pribadi dan berlaku selama 24 jam. Jika link
            sudah tidak berlaku, kamu bisa meminta link baru melalui halaman
            portal.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            © {year} CuanIN. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
