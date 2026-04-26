import { env } from "~/env";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

export const sendProductEmail = async (
    buyerEmail: string,
    productName: string,
    productLink: string
) => {
    try {
        const info = await transporter.sendMail({
            from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
            to: buyerEmail,
            subject: `Akses Produk Digital Anda: ${productName}`,
            text: `Terima kasih atas pembelian Anda!\n\nBerikut adalah link untuk mengakses produk digital Anda:\n${productLink}\n\nSalam,\nTim CuanIN`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333; line-height: 1.6;">
                    <h2 style="color: #0f172a;">Terima Kasih Atas Pembelian Anda!</h2>
                    <p>Halo,</p>
                    <p>Terima kasih telah membeli produk <strong>${productName}</strong>. Pembayaran Anda telah kami terima.</p>
                    <p>Anda dapat mengakses produk digital Anda melalui tombol di bawah ini:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${productLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Masuk ke Produk Anda</a>
                    </div>
                    <p>Atau copy & paste link berikut ke browser Anda:</p>
                    <p style="word-break: break-all; color: #3b82f6;">${productLink}</p>
                    <p>Jika Anda memiliki pertanyaan, jangan ragu untuk membalas email ini.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #64748b; text-align: center;">© ${new Date().getFullYear()} CuanIN. All rights reserved.</p>
                </div>
            `,
        });
        console.log("Email sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
};
