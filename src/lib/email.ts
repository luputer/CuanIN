import React from "react";
import { env } from "~/env";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { ProductAccessEmail } from "~/emails/product-access-email";
import { WithdrawalSuccessEmail } from "~/emails/withdrawal-success-email";
import { WithdrawalPendingEmail } from "~/emails/withdrawal-pending-email";
import { WelcomeEmail } from "~/emails/welcome-email";
import { VerifyEmail } from "~/emails/verify-email";
import { ResetPasswordEmail } from "~/emails/reset-password-email";
import { PortalLinkEmail } from "~/emails/portal-link-email";
import { PurchaseHistoryOtpEmail } from "~/emails/purchase-history-otp-email";

const resend = new Resend(env.RESEND_API_KEY);

const formatIDR = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

// ─── Tipe ─────────────────────────────────────────────────────────────────────

type SendProductEmailParams = {
  buyerEmail: string;
  productName: string;
  productLink: string;
  links: string[] | null;
  creatorName: string;
  notes?: string | null;
  portalUrl?: string | null;
};

type SendWelcomeEmailParams = {
  email: string;
  name: string;
};

type SendWithdrawalEmailParams = {
  email: string;
  amount: number;
  feeAmount: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
};

type SendVerificationEmailParams = {
  email: string;
  name: string;
  otp: string;
};

type SendPasswordResetEmailParams = {
  email: string;
  name: string;
  token: string;
};

type SendPortalLinkEmailParams = {
  email: string;
  buyerName: string;
  creatorName: string;
  portalUrl: string;
};

// ─── Product Email ────────────────────────────────────────────────────────────

export const sendProductEmail = async ({
  buyerEmail,
  productName,
  productLink,
  links: rawLinks,
  creatorName,
  notes,
  portalUrl,
}: SendProductEmailParams) => {
  const allLinks = [
    productLink,
    ...(Array.isArray(rawLinks)
      ? rawLinks.filter((l): l is string => typeof l === "string" && l.length > 0 && l !== productLink)
      : [])
  ];

  try {
    if (env.NODE_ENV === "development" && !env.RESEND_API_KEY.startsWith("re_")) {
      console.log("─────────────────────────────────────────");
      console.log("📧 LOCAL DEV EMAIL SIMULATION");
      console.log(`To: ${buyerEmail}`);
      console.log(`Subject: Akses Produk: ${productName}`);
      console.log(`Link: ${productLink}`);
      if (portalUrl) {
        console.log(`Portal: ${portalUrl}`);
      }
      console.log(`Links data:`, JSON.stringify(allLinks));
      if (allLinks && allLinks.length > 0) {
        allLinks.forEach((l, i) => console.log(`Link ${i + 1}: ${l}`));
      }
      console.log("─────────────────────────────────────────");
      return { success: true, messageId: "local-dev-id" };
    }

    const data = await resend.emails.send({
      from: `"${creatorName}" <${env.SMTP_FROM}>`,
      to: buyerEmail,
      subject: `Akses Produk Anda: ${productName}`,
      text: portalUrl
        ? `Terima kasih atas pembelian Anda!\n\nBuka portal akses pribadi Anda:\n${portalUrl}\n\nLink produk: ${productLink}${allLinks.slice(1).length > 0 ? `\n\nLink Tambahan:\n${allLinks.slice(1).map((l, i) => `${i + 1}. ${l}`).join("\n")}` : ""}${notes ? `\n\nCatatan:\n${notes}` : ""}`
        : `Terima kasih atas pembelian Anda!\n\nLink akses produk:\n${productLink}${allLinks.slice(1).length > 0 ? `\n\nLink Tambahan:\n${allLinks.slice(1).map((l, i) => `${i + 1}. ${l}`).join("\n")}` : ""}${notes ? `\n\nCatatan:\n${notes}` : ""}`,
      html: await render(
        React.createElement(ProductAccessEmail, {
          productName,
          links: allLinks,
          notes,
          portalUrl,
          year: new Date().getFullYear(),
        })
      ),
    });
    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error("Error sending product email:", error);
    return { success: false, error };
  }
};

// ─── Withdrawal Pending Email (saat creator ajukan penarikan) ─────────────────

export const sendWithdrawalPendingEmail = async ({
  email,
  amount,
  feeAmount,
  bankName,
  accountNumber,
  accountHolderName,
}: SendWithdrawalEmailParams) => {
  const transferFee = 4000;
  const netAmount = amount - feeAmount - transferFee;
  const formattedNet = formatIDR(netAmount);

  const html = await render(
    WithdrawalPendingEmail({
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
      subject: `Permintaan Penarikan Diterima – ${formattedNet}`,
      text: `Halo ${accountHolderName}, permintaan penarikan sebesar ${formattedNet} ke rekening ${bankName} ${accountNumber} telah kami terima dan sedang diproses.`,
      html,
    });
    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error("Error sending withdrawal pending email:", error);
    return { success: false, error };
  }
};

// ─── Withdrawal Success Email (saat admin konfirmasi sudah transfer) ──────────
export const sendWithdrawalEmail = async ({
  email,
  amount,
  feeAmount,
  bankName,
  accountNumber,
  accountHolderName,
}: SendWithdrawalEmailParams) => {
  const transferFee = 4000;
  const netAmount = amount - feeAmount - transferFee;
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
      text: `Halo ${accountHolderName}, dana sebesar ${formattedNet} telah berhasil dikirim ke rekening ${bankName} ${accountNumber} atas nama ${accountHolderName}.`,
      html,
    });
    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error("Error sending withdrawal success email:", error);
    return { success: false, error };
  }
};

// ─── Welcome Email ────────────────────────────────────────────────────────────

export const sendWelcomeEmail = async ({ email, name }: SendWelcomeEmailParams) => {
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
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
};

// ─── Verification Email ───────────────────────────────────────────────────────

export const sendVerificationEmail = async ({ email, name, otp }: SendVerificationEmailParams) => {
  const html = await render(
    VerifyEmail({ name, otp, year: new Date().getFullYear() })
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
    console.error("Error sending verification email:", error);
    return { success: false, error };
  }
};

// ─── Password Reset Email ─────────────────────────────────────────────────────

export const sendPasswordResetEmail = async ({ email, name, token }: SendPasswordResetEmailParams) => {
  const resetLink = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const html = await render(
    ResetPasswordEmail({ name, resetUrl: resetLink, year: new Date().getFullYear() })
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
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
};

// ─── Portal Link Email ────────────────────────────────────────────────────────

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
    if (env.NODE_ENV === "development" && !env.RESEND_API_KEY.startsWith("re_")) {
      console.log("─────────────────────────────────────────");
      console.log("📧 LOCAL DEV EMAIL SIMULATION");
      console.log(`To: ${email}`);
      console.log(`Subject: Link Portal Akses: ${creatorName}`);
      console.log(`Portal: ${portalUrl}`);
      console.log("─────────────────────────────────────────");
      return { success: true, messageId: "local-dev-id" };
    }

    const data = await resend.emails.send({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Link Portal Akses dari ${creatorName}`,
      text: `Halo ${buyerName}, berikut link portal akses kamu untuk semua produk dari ${creatorName}: ${portalUrl}`,
      html,
    });
    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error("Error sending portal link email:", error);
    return { success: false, error };
  }
};

// ─── Purchase History OTP Email ───────────────────────────────────────────────

type SendPurchaseHistoryOtpParams = {
  email: string;
  otp: string;
};

export const sendPurchaseHistoryOtpEmail = async ({
  email,
  otp,
}: SendPurchaseHistoryOtpParams) => {
  const html = await render(
    React.createElement(PurchaseHistoryOtpEmail, {
      otp,
      email,
      year: new Date().getFullYear(),
    })
  );

  try {
    const data = await resend.emails.send({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Kode OTP Akses Riwayat Pembelian 🛒`,
      text: `Kode OTP untuk mengakses riwayat pembelian Anda: ${otp}. Kode ini berlaku selama 10 menit.`,
      html,
    });
    return { success: true, messageId: data.data?.id };
  } catch (error) {
    console.error("Error sending purchase history OTP email:", error);
    return { success: false, error };
  }
};
