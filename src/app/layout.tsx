import "~/styles/globals.css";

import { type Metadata } from "next";
import { Poppins } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/provider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "CuanIN",
  description:
    "Platform jual beli produk digital, webinar, dan kelas online. Buat toko online kamu dan mulai dapatkan penghasilan.",
  icons: [{ rel: "icon", url: "/icon-cuanin.svg", type: "image/svg+xml" }],
  openGraph: {
    title: "CuanIN",
    description:
      "Platform jual beli produk digital, webinar, dan kelas online.",
    url: "/",
    siteName: "CuanIN",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CuanIN",
    description:
      "Platform jual beli produk digital, webinar, dan kelas online.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className="font-sans">
        <Toaster position="top-right" />
        <TRPCReactProvider>
          {children}
          <Analytics />
          <SpeedInsights />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
