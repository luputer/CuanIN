import React from "react";
import { env } from "~/env";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { ProductAccessEmail } from "~/emails/product-access-email";
import { WithdrawalSuccessEmail } from "~/emails/withdrawal-success-email";
import { WelcomeEmail } from "~/emails/welcome-email";
import { VerifyEmail } from "~/emails/verify-email";
import { ResetPasswordEmail } from "~/emails/reset-password-email";
import { PortalLinkEmail } from "~/emails/portal-link-email";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT, // Ini sudah bertipe number murni
  secure: env.SMTP_PORT === 465, // Ambil perbandingan angka murni (465 === 465)
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
});

type SendProductEmailParams = {
  buyerEmail: string;
  productName: string;
  productLink: string;
  links?: string[] | null;
  creatorName: string;
  notes?: string | null;
  portalUrl?: string | null;
};

export const sendProductEmail = async ({
  buyerEmail,
  productName,
  productLink,
  links,
  creatorName,
  notes,
  portalUrl,
}: SendProductEmailParams) => {
  const html = await render(
    React.createElement(ProductAccessEmail, {
      productName,
      productLink,
      links,
      notes,
      portalUrl,
      year: new Date().getFullYear(),
    })
  );

  try {
    const linksText = links && links.length > 0 ? `\n\nLink Tambahan:\n${links.map((l, i) => `${i + 1}. ${l}`).join("\n")}` : "";
    const textContent = portalUrl
      ? `Terima kasih atas pembelian Anda!\n\nBuka portal akses pribadi Anda:\n${portalUrl}\n\nLink produk: ${productLink}${linksText}${notes ? `\n\nCatatan Tambahan:\n${notes}` : ''}\n\nSalam,\nTim CuanIN`
      : `Terima kasih atas pembelian Anda!\n\nBerikut adalah link untuk mengakses produk Anda:\n${productLink}${linksText}${notes ? `\n\nCatatan Tambahan:\n${notes}` : ''}\n\nSalam,\nTim CuanIN`;

    const info = await transporter.sendMail({
      from: `"${creatorName}" <${env.SMTP_FROM}>`,
      to: buyerEmail,
      subject: `Akses Produk Anda: ${productName}`,
      text: textContent,
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
  feeAmount: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
};

export const sendWithdrawalEmail = async ({
  email,
  amount,
  feeAmount,
  bankName,
  accountNumber,
  accountHolderName,
}: SendWithdrawalEmailParams) => {
  const xenditFee = 4000;
  const netAmount = amount - feeAmount - xenditFee;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);

  const formattedNet = formatIDR(netAmount);

  const html = await render(
    WithdrawalSuccessEmail({
      accountHolderName,
      accountNumber,
      bankName,
      formattedAmount: formattedNet,
      year: new Date().getFullYear(),
    })
  );

  try {
    const info = await transporter.sendMail({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Penarikan Saldo Berhasil – ${formattedNet}`,
      text: `Penarikan saldo sebesar ${formatIDR(amount)} (Total diterima: ${formattedNet} setelah biaya) ke rekening ${bankName} ${accountNumber} atas nama ${accountHolderName} telah berhasil diproses.`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending withdrawal email:", error);
    return { success: false, error };
  }
};

type SendWelcomeEmailParams = {
  email: string;
  name: string;
};

// saat register email
export const sendWelcomeEmail = async ({
  email,
  name,
}: SendWelcomeEmailParams) => {
  const html = await render(
    WelcomeEmail({
      name,
      dashboardUrl: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
      year: new Date().getFullYear(),
    })
  );

  try {
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

type SendVerificationEmailParams = {
  email: string;
  name: string;
  otp: string;
};

export const sendVerificationEmail = async ({
  email,
  name,
  otp,
}: SendVerificationEmailParams) => {
  const html = await render(
    VerifyEmail({
      name,
      otp,
      year: new Date().getFullYear(),
    })
  );

  try {
    const info = await transporter.sendMail({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Kode Verifikasi OTP Anda 🔐`,
      text: `Halo ${name}, kode OTP Anda adalah ${otp}. Kode ini berlaku selama 10 menit.`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
};

type SendPasswordResetEmailParams = {
  email: string;
  name: string;
  token: string;
};

export const sendPasswordResetEmail = async ({
  email,
  name,
  token,
}: SendPasswordResetEmailParams) => {
  const resetLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const html = await render(
    ResetPasswordEmail({
      name,
      resetUrl: resetLink,
      year: new Date().getFullYear(),
    })
  );

  try {
    const info = await transporter.sendMail({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Reset Password Anda 🔑`,
      text: `Halo ${name}, klik link berikut untuk mereset password Anda: ${resetLink}`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
};

type SendPortalLinkEmailParams = {
  email: string;
  buyerName: string;
  creatorName: string;
  portalUrl: string;
};

export const sendPortalLinkEmail = async ({
  email,
  buyerName,
  creatorName,
  portalUrl,
}: SendPortalLinkEmailParams) => {
  const html = await render(
    PortalLinkEmail({
      buyerName,
      productName: creatorName,
      portalUrl,
      year: new Date().getFullYear(),
    })
  );

  try {
    const info = await transporter.sendMail({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Link Portal Akses dari ${creatorName}`,
      text: `Halo ${buyerName}, berikut link portal akses kamu untuk semua produk dari ${creatorName}: ${portalUrl}`,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending portal link email:", error);
    return { success: false, error };
  }
};
