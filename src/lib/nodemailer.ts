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

  const formatIDR = (val: number) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);

  const formattedNet = formatIDR(netAmount);

  try {
    const info = await transporter.sendMail({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Penarikan Saldo Berhasil – ${formattedNet}`,
      text: `Penarikan saldo sebesar ${formatIDR(amount)} (Diterima bersih: ${formattedNet} setelah biaya) ke rekening ${bankName} ${accountNumber} atas nama ${accountHolderName} telah berhasil diproses.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #0f172a;">Penarikan Saldo Berhasil ✅</h2>
          <p>Halo <strong>${accountHolderName}</strong>,</p>
          <p>Permintaan penarikan saldo kamu telah berhasil diproses oleh sistem.</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 140px;">Nominal Ditarik</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${formatIDR(amount)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Biaya Aplikasi</td>
                <td style="padding: 8px 0; color: #ef4444; text-align: right;">- ${formatIDR(feeAmount)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Biaya Transfer</td>
                <td style="padding: 8px 0; color: #ef4444; text-align: right;">- ${formatIDR(xenditFee)}</td>
              </tr>
              <tr>
                <td colspan="2" style="border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 12px;"></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">Total Diterima</td>
                <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #16a34a; text-align: right;">${formattedNet}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
             <p style="margin: 0; font-size: 13px; color: #92400e;">
               <strong>Info:</strong> Dana dikirimkan ke <strong>${bankName} - ${accountNumber}</strong> a.n <strong>${accountHolderName}</strong>. 
               Waktu masuk dana tergantung pada jam operasional dan kebijakan bank tujuan.
             </p>
          </div>

          <p>Jika kamu merasa tidak melakukan transaksi ini atau ada kendala, segera hubungi tim support kami dengan membalas email ini.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">© ${new Date().getFullYear()} CuanIN. All rights reserved.</p>
        </div>
      `,
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
    const info = await transporter.sendMail({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Selamat Datang di CuanIN, ${name}! 🎉`,
      text: `Halo ${name}, selamat datang di CuanIN! Akun kamu telah berhasil dibuat.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #0891b2;">Selamat Datang di CuanIN! 🎉</h2>
          <p>Halo <strong>${name}</strong>,</p>
          <p>Akun kamu telah berhasil dibuat. Sekarang kamu bisa mulai menjual produk digital dan menerima pembayaran dengan mudah.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Masuk ke Dashboard</a>
          </div>
          <p>Jika ada pertanyaan, jangan ragu untuk membalas email ini.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">© ${new Date().getFullYear()} CuanIN. All rights reserved.</p>
        </div>
      `,
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
  try {
    const info = await transporter.sendMail({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Kode Verifikasi OTP Anda 🔐`,
      text: `Halo ${name}, kode OTP Anda adalah ${otp}. Kode ini berlaku selama 10 menit.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #0891b2;">Verifikasi Email Anda</h2>
          <p>Halo <strong>${name}</strong>,</p>
          <p>Terima kasih telah mendaftar di CuanIN. Berikut adalah kode OTP untuk memverifikasi email Anda:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; background-color: #f1f5f9; padding: 10px 20px; border-radius: 8px;">${otp}</span>
          </div>
          <p>Kode OTP ini berlaku selama <strong>10 menit</strong>. Jangan bagikan kode ini kepada siapapun.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">© ${new Date().getFullYear()} CuanIN. All rights reserved.</p>
        </div>
      `,
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

  try {
    const info = await transporter.sendMail({
      from: `"Tim CuanIN" <${env.SMTP_FROM}>`,
      to: email,
      subject: `Reset Password Anda 🔑`,
      text: `Halo ${name}, klik link berikut untuk mereset password Anda: ${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333; line-height: 1.6;">
          <h2 style="color: #0891b2;">Reset Password</h2>
          <p>Halo <strong>${name}</strong>,</p>
          <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah ini untuk membuat password baru:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>Atau copy & paste link berikut ke browser Anda:</p>
          <p style="word-break: break-all; color: #0891b2;">${resetLink}</p>
          <p>Link ini berlaku selama <strong>1 jam</strong>.</p>
          <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">© ${new Date().getFullYear()} CuanIN. All rights reserved.</p>
        </div>
      `,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
};