import crypto from "crypto";

// AUTH_SECRET bisa undefined di development (optional), fallback ke env langsung
const SECRET = process.env.AUTH_SECRET ?? "fallback-secret-change-me";
const EXPIRES_IN_MS = 24 * 60 * 60 * 1000; // 24 jam

interface HistoryTokenPayload {
  email: string;
  iat: number; // issued at (timestamp ms)
  exp: number; // expires at (timestamp ms)
}

/**
 * Generate signed token setelah OTP berhasil diverifikasi.
 * Token berisi: base64(payload) + "." + HMAC signature
 */
export function generateHistoryToken(email: string): string {
  const payload: HistoryTokenPayload = {
    email: email.toLowerCase(),
    iat: Date.now(),
    exp: Date.now() + EXPIRES_IN_MS,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payloadBase64)
    .digest("base64url");

  return `${payloadBase64}.${sig}`;
}

/**
 * Verifikasi signed token.
 * Return payload jika valid, null jika tidak valid / kadaluarsa.
 */
export function verifyHistoryToken(
  token: string,
): { email: string } | null {
  try {
    const [payloadBase64, sig] = token.split(".");
    if (!payloadBase64 || !sig) return null;

    // Validasi signature
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(payloadBase64)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }

    // Parse payload
    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf-8"),
    ) as HistoryTokenPayload;

    // Cek expiry
    if (Date.now() > payload.exp) return null;

    return { email: payload.email };
  } catch {
    return null;
  }
}
