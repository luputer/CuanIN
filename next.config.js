import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-3098f58e584244c8bf48888938b34bae.r2.dev",
      },
      {
        protocol: "https",
        hostname: "storage.cuanin.my.id",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              // Tambahkan domain widget ke script-src
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://*.midtrans.com https://app.midtrans.com https://snap-assets.midtrans.com https://api.midtrans.com https://pay.google.com https://gwk.gopayapi.com https://js.xendit.co https://auxilium-widget.vercel.app;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' blob: data: https:;",
              "font-src 'self' data:;",
              // Tambahkan juga ke connect-src agar widget bisa berkomunikasi dengan servernya
              "connect-src 'self' https: https://*.midtrans.com https://api.midtrans.com https://api.sandbox.midtrans.com https://auxilium-widget.vercel.app;",
              "frame-src 'self' https://*.midtrans.com https://app.midtrans.com https://js.xendit.co https://auxilium-widget.vercel.app;",
              "child-src 'self' https://*.midtrans.com https://app.midtrans.com;",
              "worker-src 'self' blob:;",
              "frame-ancestors 'self';"
            ].join(" "),
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default config;