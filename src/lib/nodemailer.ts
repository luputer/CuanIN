import { env } from "~/env";
import nodemailer from "nodemailer";
import { render } from "react-email";
import { ProductAccessEmail } from "~/emails/product-access-email";
import { WelcomeEmail } from "~/emails/welcome-email";
import { WithdrawalSuccessEmail } from "~/emails/withdrawal-success-email";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

type SendProductEmailParams = {
  buyerEmail: string;
  productName: string;
  productLink: string;
};

type SendWelcomeEmailParams = {
  email: string;
  name: string;
};

export const sendProductEmail = async ({
  buyerEmail,
  productName,
  productLink,
}: SendProductEmailParams) => {
  try {
    const year = new Date().getFullYear();
    const html = await render(
      ProductAccessEmail({ productName, productLink, year }),
    );
    const info = await transporter.sendMail({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: buyerEmail,
      subject: `Akses Produk Digital Anda: ${productName}`,
      text: `Terima kasih atas pembelian Anda!\n\nBerikut adalah link untuk mengakses produk digital Anda:\n${productLink}\n\nSalam,\nTim CuanIN`,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

type SendWithdrawalEmailParams = {
  email: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
};

export const sendWithdrawalEmail = async ({
  email,
  amount,
  bankName,
  accountNumber,
  accountHolderName,
}: SendWithdrawalEmailParams) => {
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

  try {
    const year = new Date().getFullYear();
    const html = await render(
      WithdrawalSuccessEmail({
        accountHolderName,
        accountNumber,
        bankName,
        formattedAmount,
        year,
      }),
    );
    const info = await transporter.sendMail({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Penarikan Saldo Berhasil – ${formattedAmount}`,
      text: `Penarikan saldo sebesar ${formattedAmount} ke rekening ${bankName} ${accountNumber} atas nama ${accountHolderName} telah berhasil diproses.`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending withdrawal email:", error);
    return { success: false, error };
  }
};

// saat register email
export const sendWelcomeEmail = async ({
  email,
  name,
}: SendWelcomeEmailParams) => {
  try {
    const year = new Date().getFullYear();
    const html = await render(
      WelcomeEmail({
        dashboardUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
        name,
        year,
      }),
    );
    const info = await transporter.sendMail({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Selamat Datang di CuanIN, ${name}! 🎉`,
      text: `Halo ${name}, selamat datang di CuanIN! Akun kamu telah berhasil dibuat.`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
};
