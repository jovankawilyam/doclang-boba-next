import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Doclang Boba",
  description: "Layanan Dokumen Pasca Lelang KPKNL Bogor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${roboto.variable}`}>
      <head>
        <link rel="preconnect" href="https://maps.googleapis.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
