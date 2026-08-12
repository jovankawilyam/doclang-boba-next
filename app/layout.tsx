import type { Metadata } from "next";
import "./globals.css";

const fontClassName = "font-sans";

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
    <html lang="id" data-scroll-behavior="smooth" className={fontClassName}>
      <body>{children}</body>
    </html>
  );
}
