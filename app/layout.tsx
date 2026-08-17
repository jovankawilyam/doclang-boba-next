import type { Metadata } from "next";
import "./globals.css";

const fontClassName = "font-sans";

export const metadata: Metadata = {
  title: "Dokumen Pasca Lelang Bogor Bageur",
  description: "Doclang Boba",
  keywords: [
    "Dokumen Pasca Lelang KPKNL Bogor Bageur",
    "Layanan Dokumen Pasca Lelang KPKNL Bogor Bageur",
    "Dokumen Pasca Lelang KPKNL Bogor Bageur",
    "Layanan Dokumen Pasca Lelang KPKNL Bogor Bageur",
  ],
  openGraph: {
    title: "Doclang Boba",
    description: "Dokumen Pasca Lelang KPKNL Bogor Bageur",
    url: "",
      siteName: "Doclang Boba",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Doclang Boba",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
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
