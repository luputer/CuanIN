import React from "react";
import { env } from "~/env";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { ProductAccessEmail } from "~/emails/product-access-email";
import { WithdrawalSuccessEmail } from "~/emails/withdrawal-success-email";
import { WelcomeEmail } from "~/emails/welcome-email";
import { VerifyEmail } from "~/emails/verify-email";
import { ResetPasswordEmail } from "~/emails/reset-password-email";

const resend = new Resend(env.RESEND_API_KEY);

type SendProductEmailParams = {
  buyerEmail: string;
  productName: string;
  productLink: string;
  creatorName: string;
  notes?: string | null;
};

type SendWelcomeEmailParams = {
  email: string;
  name: string;
};

export const sendProductEmail = async ({
  buyerEmail,
  productName,
  productLink,
  creatorName,
  notes,
}: SendProductEmailParams) => {
  const html = await render(
    React.createElement(ProductAccessEmail, {
      productName,
      productLink,
      notes,
      year: new Date().getFullYear(),
    })
  );

  try {
    const textContent = `Terima kasih atas pembelian Anda!\n\nBerikut adalah link untuk mengakses produk Anda:\n${productLink}${notes ? `\n\nCatatan Tambahan:\n${notes}` : ""}\n\nSalam,\nTim CuanIN`;

    const data = await resend.emails.send({
      from: `"${creatorName}" <${env.SMTP_FROM}>`,
      to: buyerEmail,
      subject: `Akses Produk Anda: ${productName}`,
      text: textContent,
      html,
    });
    console.log("Email sent via Resend:", data.data?.id);
    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error("Error sending email via Resend:", error);
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
    const data = await resend.emails.send({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Penarikan Saldo Berhasil – ${formattedNet}`,
      text: `Penarikan saldo sebesar ${formatIDR(amount)} (Total diterima: ${formattedNet} setelah biaya) ke rekening ${bankName} ${accountNumber} atas nama ${accountHolderName} telah berhasil diproses.`,
      html,
    });
    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error("Error sending withdrawal email via Resend:", error);
    return { success: false, error };
  }
};

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
    const data = await resend.emails.send({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Selamat Datang di CuanIN, ${name}! 🎉`,
      text: `Halo ${name}, selamat datang di CuanIN! Akun kamu telah berhasil dibuat.`,
      html,
    });
    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error("Error sending welcome email via Resend:", error);
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
    const data = await resend.emails.send({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Kode Verifikasi OTP Anda 🔐`,
      text: `Halo ${name}, kode OTP Anda adalah ${otp}. Kode ini berlaku selama 10 menit.`,
      html,
    });
    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error("Error sending verification email via Resend:", error);
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
    const data = await resend.emails.send({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Reset Password Anda 🔑`,
      text: `Halo ${name}, klik link berikut untuk mereset password Anda: ${resetLink}`,
      html,
    });
    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error("Error sending password reset email via Resend:", error);
    return { success: false, error };
  }
};
