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
} from "./styles";

export type WithdrawalPendingEmailProps = {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    formattedAmount: string;
    year: number;
};

export function WithdrawalPendingEmail({
    accountHolderName,
    accountNumber,
    bankName,
    formattedAmount,
    year,
}: WithdrawalPendingEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Permintaan penarikan {formattedAmount} sedang diproses.</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Text style={heading}>Permintaan Penarikan Diterima</Text>
                    <Text style={paragraph}>
                        Halo <strong>{accountHolderName}</strong>,
                    </Text>
                    <Text style={paragraph}>
                        Permintaan penarikan saldo kamu telah kami terima dan sedang menunggu diproses oleh tim CuanIN. Berikut detailnya:
                    </Text>
                    <Section style={detailBox}>
                        <Text style={detailLabel}>Jumlah Diterima</Text>
                        <Text style={{ ...detailValue, color: "#0891b2", fontWeight: "bold" }}>{formattedAmount}</Text>
                        <Text style={detailLabel}>Bank</Text>
                        <Text style={detailValue}>{bankName}</Text>
                        <Text style={detailLabel}>No. Rekening</Text>
                        <Text style={detailValue}>{accountNumber}</Text>
                        <Text style={detailLabel}>Atas Nama</Text>
                        <Text style={finalDetailValue}>{accountHolderName}</Text>
                    </Section>
                    <Text style={paragraph}>
                        Tim kami akan memproses transfer dalam waktu 1x24 jam kerja. Kamu akan mendapat email konfirmasi setelah dana berhasil dikirim.
                    </Text>
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
